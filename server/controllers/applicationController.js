const Application  = require("../models/Application");
const PlacementDrive = require("../models/PlacementDrive");
const MemberProfile= require("../models/MemberProfile");
const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter } = require("../middleware/tenantMiddleware");
const { writeAudit } = require("../utils/audit");


const getMyApplications = async (req, res) => {
  try {
    const { stage, limit = 50, page = 1 } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = tenantFilter(req, { student: req.user._id });
    if (stage) filter.currentStage = stage;

    const applications = await Application.find(filter)
      .populate("company", "name logo industry")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    return successResponse(res, 200, "Applications fetched", {
      applications,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/drives/:id/apply
const applyForDrive = async (req, res) => {
  try {
    const driveId = req.params.id;
    const studentId = req.user._id;

    // 1. Fetch Drive and verify it exists
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) return errorResponse(res, 404, "Drive not found");
    
    // 2. Basic Status Check
    if (drive.status !== "ACTIVE") {
      return errorResponse(res, 400, "This drive is not accepting applications.");
    }

    // 3. Strict Deadline Check
    if (drive.applicationDeadline) {
      const deadline = new Date(drive.applicationDeadline);
      deadline.setHours(23, 59, 59, 999); 
      if (new Date() > deadline) {
        return errorResponse(res, 403, "The registration deadline for this drive has passed.");
      }
    }

    // 4. Check if already applied
    const existingApp = await Application.findOne({ drive: driveId, student: studentId });
    if (existingApp) return errorResponse(res, 400, "You have already applied for this drive.");

    // 5. Check mathematical eligibility 
    const profile = await MemberProfile.findOne({ user: studentId });
    if (!profile) return errorResponse(res, 404, "Student profile not found.");
    
    if (profile.cgpa < drive.minCGPA) {
      return errorResponse(res, 403, `Eligibility failed: Minimum CGPA ${drive.minCGPA} required.`);
    }
    if (profile.activeBacklogs > drive.maxBacklogs) {
      return errorResponse(res, 403, `Eligibility failed: Maximum ${drive.maxBacklogs} backlogs allowed.`);
    }
    if (drive.eligiblePrograms.length > 0 && !drive.eligiblePrograms.includes(profile.program)) {
      return errorResponse(res, 403, "Eligibility failed: Your branch is not eligible.");
    }
    if (drive.graduationYears.length > 0 && !drive.graduationYears.includes(profile.graduationYear)) {
      return errorResponse(res, 403, "Eligibility failed: Your graduation batch is not eligible.");
    }

    // 6. Create the Application (Safely pulling data from DB, not req.body)
    const application = await Application.create({
      institution: req.institutionId,
      drive: drive._id,
      student: studentId,
      company: drive.company, // Auto-linked from the drive
      role: drive.roles?.[0]?.title || "Placement Candidate", // Auto-fallback
      currentStage: "Applied",
      stageHistory: [{ stage: "Applied", note: "Application submitted", date: Date.now() }],
      applyDate: Date.now()
    });

    // 7.  NEW: TWO-WAY DATA PUSH (Store IDs in respective models)
    await Promise.all([
      PlacementDrive.findByIdAndUpdate(driveId, { $addToSet: { appliedStudents: studentId } }),
      MemberProfile.findOneAndUpdate({ user: studentId }, { $addToSet: { appliedDrives: driveId } })
    ]);

    return successResponse(res, 201, "Successfully applied for the drive!", application);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ADD APPLICATION ──────────────────────────────────────────────────────
// POST /api/applications
const addApplication = async (req, res) => {
  try {
    // Only current students can add applications
    if (!["ENROLLED","FINAL_YEAR"].includes(req.user.academicStatus)) {
      return errorResponse(res, 403, "Only current students can track applications");
    }

    const { companyId, role, notes, applyDate, isPrivate } = req.body;

    if (!companyId || !role)
      return errorResponse(res, 400, "Company and role are required");

    const existing = await Application.findOne({
      student:     req.user._id,
      company:     companyId,
      institution: req.institutionId,
    });
    if (existing)
      return errorResponse(res, 400, "You already have an application for this company");

    const application = await Application.create({
      institution: req.institutionId,
      student:     req.user._id,
      company:     companyId,
      role,
      notes,
      applyDate:   applyDate || Date.now(),
      isPrivate:   isPrivate || false,
      currentStage: "Applied",
      stageHistory: [{ stage: "Applied", note: "Application created", date: Date.now() }],
    });

    await application.populate("company", "name logo industry");

    return successResponse(res, 201, "Application added successfully", application);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE STAGE ─────────────────────────────────────────────────────────
// PUT /api/applications/:id/stage
const updateStage = async (req, res) => {
  try {
    const { stage, note } = req.body;
    if (!stage) return errorResponse(res, 400, "Stage is required");

    const application = await Application.findOne({
      _id:         req.params.id,
      student:     req.user._id,
      institution: req.institutionId,
    }).populate("company", "name");

    if (!application) return errorResponse(res, 404, "Application not found");

    application.currentStage = stage;
    application.stageHistory.push({ stage, note: note || "", date: new Date() });

    // Auto-update placement status when placed
    if (["Offer Received","Joined"].includes(stage)) {
      const User = require("../models/User");
      await User.findByIdAndUpdate(req.user._id, {
        placementStatus: "PLACED",
      });
      await MemberProfile.findOneAndUpdate(
        { user: req.user._id },
        { currentCompany: application.company?.name }
      );
    }

    await application.save();

    await Notification.create({
      recipient:          req.user._id,
      institution:        req.institutionId,
      type:               "application_update",
      title:              "Application Stage Updated",
      message:            `Your application at ${application.company?.name} moved to "${stage}"`,
      link:               "/journey",
      relatedApplication: application._id,
    });

    if (req.io) {
      req.io.to(`user:${req.user._id}`).emit("notification:new", {
        type:    "application_update",
        title:   "Application Updated",
        message: `${application.company?.name} → ${stage}`,
      });
    }
    await writeAudit(req, {
      action: "UPDATE_APPLICATION_STAGE",
      entity: "Application",
      entityId: application._id,
      meta: { stage }
    });

    return successResponse(res, 200, "Stage updated successfully", application);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE APPLICATION ───────────────────────────────────────────────────
// PUT /api/applications/:id
const updateApplication = async (req, res) => {
  try {
    const { role, notes, ctcOffered, isPrivate } = req.body;

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id, institution: req.institutionId },
      { role, notes, ctcOffered, isPrivate },
      { new: true, runValidators: true }
    ).populate("company", "name logo industry");

    if (!application) return errorResponse(res, 404, "Application not found");

    return successResponse(res, 200, "Application updated", application);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DELETE APPLICATION ───────────────────────────────────────────────────
// DELETE /api/applications/:id
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id:         req.params.id,
      student:     req.user._id,
      institution: req.institutionId,
    });

    if (!application) return errorResponse(res, 404, "Application not found");

    return successResponse(res, 200, "Application deleted successfully");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET SINGLE APPLICATION ───────────────────────────────────────────────
// GET /api/applications/:id
const getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id:         req.params.id,
      student:     req.user._id,
      institution: req.institutionId,
    }).populate("company", "name logo industry rounds skillsRequired");

    if (!application) return errorResponse(res, 404, "Application not found");

    return successResponse(res, 200, "Application fetched", application);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPLOAD OFFER LETTER (Student) ───────────────────────────────────────
// POST /api/applications/:id/offer
const uploadOfferLetter = async (req, res) => {
  try {
    const { url, publicId } = req.body;
    if (!url) return errorResponse(res, 400, "File URL is required");

    const application = await Application.findOne({
      _id: req.params.id,
      student: req.user._id,
      institution: req.institutionId,
    });

    if (!application) return errorResponse(res, 404, "Application not found");

    application.offerLetterUrl = url;
    if (publicId) application.offerLetterPublicId = publicId;
    application.offerVerificationStatus = "PENDING";
    application.offerDate = new Date();
    await application.save();

    return successResponse(res, 200, "Offer letter uploaded successfully", application);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── VERIFY OFFER (Officer) ────────────────────────────────────────────────
// PUT /api/applications/:id/verify-offer
const verifyOffer = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return errorResponse(res, 400, "Status must be VERIFIED or REJECTED");
    }

    const application = await Application.findOne({
      _id: req.params.id,
      institution: req.institutionId,
    }).populate("company", "name");

    if (!application) return errorResponse(res, 404, "Application not found");

    application.offerVerificationStatus = status;
    application.offerVerifiedBy = req.user._id;
    if (notes) application.notes = (application.notes ? application.notes + "\n" : "") + "Verification Note: " + notes;
    await application.save();

    if (status === "VERIFIED") {
      const User = require("../models/User");
      await User.findByIdAndUpdate(application.student, {
        placementStatus: "PLACED",
      });
      await MemberProfile.findOneAndUpdate(
        { user: application.student },
        { 
          offerLetterUrl: application.offerLetterUrl,
          offerCompany: application.company?.name,
          offerVerificationStatus: "VERIFIED"
        }
      );
    }

    // Notify student
    await Notification.create({
      recipient: application.student,
      institution: req.institutionId,
      type: "application_update",
      title: "Offer Letter Update",
      message: `Your offer letter from ${application.company?.name} was ${status.toLowerCase()}`,
      link: "/journey",
      relatedApplication: application._id,
    });

    return successResponse(res, 200, `Offer ${status.toLowerCase()} successfully`, application);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  applyForDrive,
  getMyApplications,
  addApplication,
  updateStage,
  updateApplication,
  deleteApplication,
  getApplication,
  uploadOfferLetter,
  verifyOffer
};
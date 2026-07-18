const Application  = require("../models/Application");
const MemberProfile= require("../models/MemberProfile");
const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter } = require("../middleware/tenantMiddleware");

// ─── GET MY APPLICATIONS ──────────────────────────────────────────────────
// GET /api/applications/my
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
      const { default: User } = await import("../models/User.js").catch(() => ({ default: require("../models/User") }));
      await require("../models/User").findByIdAndUpdate(req.user._id, {
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

module.exports = {
  getMyApplications,
  addApplication,
  updateStage,
  updateApplication,
  deleteApplication,
  getApplication,
};
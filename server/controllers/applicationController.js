const Application = require("../models/Application");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── GET MY APPLICATIONS ──────────────────────────────────────────────────
// GET /api/applications/my
const getMyApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, "Student profile not found");

    const { stage, limit = 50, page = 1 } = req.query;
    const filter = { student: student._id };
    if (stage) filter.currentStage = stage;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filter)
      .populate("company", "name logo domain driveStatus upcomingDriveDate")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    return successResponse(res, 200, "Applications fetched", {
      applications,
      total,
      page: parseInt(page),
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
    const { companyId, role, notes, applyDate, isPrivate } = req.body;

    if (!companyId || !role) {
      return errorResponse(res, 400, "Company and role are required");
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, "Student profile not found");

    const company = await Company.findById(companyId);
    if (!company) return errorResponse(res, 404, "Company not found");

    // Check duplicate
    const existing = await Application.findOne({
      student: student._id,
      company: companyId,
    });
    if (existing) {
      return errorResponse(res, 400, "You already have an application for this company");
    }

    const application = await Application.create({
      student: student._id,
      company: companyId,
      role,
      notes,
      applyDate: applyDate || Date.now(),
      isPrivate: isPrivate || false,
      currentStage: "Applied",
      stageHistory: [{ stage: "Applied", note: "Application created", date: Date.now() }],
    });

    await application.populate("company", "name logo domain");

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

    const student = await Student.findOne({ user: req.user._id });
    const application = await Application.findOne({
      _id: req.params.id,
      student: student._id,
    }).populate("company", "name");

    if (!application) return errorResponse(res, 404, "Application not found");

    application.currentStage = stage;
    application.stageHistory.push({ stage, note: note || "", date: new Date() });

    // If placed, update student placement status
    if (stage === "Joined") {
      await Student.findByIdAndUpdate(student._id, {
        placementStatus: "placed",
        placedAt: application.company?.name,
      });
    }

    await application.save();

    // Create notification
    await Notification.create({
      recipient: req.user._id,
      type: "application_update",
      title: "Application Stage Updated",
      message: `Your application at ${application.company?.name} moved to "${stage}"`,
      link: "/journey",
      relatedApplication: application._id,
    });

    // Emit socket notification
    if (req.io) {
      req.io.to(`user:${req.user._id}`).emit("notification:new", {
        type: "application_update",
        title: "Application Updated",
        message: `${application.company?.name} → ${stage}`,
      });
    }

    return successResponse(res, 200, "Stage updated successfully", application);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE APPLICATION (notes, role, CTC etc.) ───────────────────────────
// PUT /api/applications/:id
const updateApplication = async (req, res) => {
  try {
    const { role, notes, ctcOffered, isPrivate } = req.body;
    const student = await Student.findOne({ user: req.user._id });

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, student: student._id },
      { role, notes, ctcOffered, isPrivate },
      { new: true, runValidators: true }
    ).populate("company", "name logo domain");

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
    const student = await Student.findOne({ user: req.user._id });
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      student: student._id,
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
    const student = await Student.findOne({ user: req.user._id });
    const application = await Application.findOne({
      _id: req.params.id,
      student: student._id,
    }).populate("company", "name logo domain rounds skillsRequired");

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
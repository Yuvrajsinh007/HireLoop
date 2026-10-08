const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter } = require("../middleware/tenantMiddleware");

// GET /api/announcements
const getAnnouncements = async (req, res) => {
  try {
    const filter = tenantFilter(req, {});
    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name email")
      .populate("academicUnit", "name code")
      .populate("program", "name code")
      .populate("drive", "title company")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Announcements fetched", announcements);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// GET /api/announcements/:id
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne(tenantFilter(req, { _id: req.params.id }))
      .populate("createdBy", "name email")
      .populate("academicUnit", "name")
      .populate("program", "name")
      .populate("drive", "title");

    if (!announcement) return errorResponse(res, 404, "Announcement not found");
    return successResponse(res, 200, "Announcement fetched", announcement);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/announcements
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, target, academicUnit, program, graduationYear, drive, scheduledFor, status } = req.body;

    if (!title || !message) return errorResponse(res, 400, "Title and message are required");

    const announcement = await Announcement.create({
      institution: req.institutionId,
      title,
      message,
      target: target || "ALL",
      academicUnit,
      program,
      graduationYear,
      drive,
      scheduledFor,
      status: status || "DRAFT",
      createdBy: req.user._id,
      sentAt: (status === "SENT" || (!scheduledFor && !status)) ? new Date() : null
    });

    if (announcement.status === "SENT") {
      // Create notification for ALL users in institution for now. 
      // In production, we filter by target, program etc.
      // We will skip full user fetching here to keep it simple, or do a general insert.
      // Wait, we need to populate stats or notify properly later.
    }

    return successResponse(res, 201, "Announcement created", announcement);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// PUT /api/announcements/:id
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOneAndUpdate(
      tenantFilter(req, { _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) return errorResponse(res, 404, "Announcement not found");
    return successResponse(res, 200, "Announcement updated", announcement);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOneAndDelete(tenantFilter(req, { _id: req.params.id }));
    if (!announcement) return errorResponse(res, 404, "Announcement not found");
    return successResponse(res, 200, "Announcement deleted", announcement);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};

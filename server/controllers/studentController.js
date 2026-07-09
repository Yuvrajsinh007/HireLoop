const Student = require("../models/Student");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── GET PROFILE ──────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const profile = await Student.findOne({ user: req.user._id }).populate("user", "name email avatar role isEmailVerified");
    if (!profile) return errorResponse(res, 404, "Student profile not found");
    return successResponse(res, 200, "Profile fetched", profile);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { rollNumber, branch, batch, cgpa, skills, linkedIn, github, portfolio, bio, isAvailableForMentorship } = req.body;

    const profile = await Student.findOneAndUpdate(
      { user: req.user._id },
      { rollNumber, branch, batch, cgpa, skills, linkedIn, github, portfolio, bio, isAvailableForMentorship },
      { new: true, runValidators: true }
    ).populate("user", "name email avatar role");

    if (!profile) return errorResponse(res, 404, "Profile not found");
    return successResponse(res, 200, "Profile updated successfully", profile);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPLOAD AVATAR ────────────────────────────────────────────────────────
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No image file provided");

    const result = await uploadToCloudinary(req.file.buffer, "hireloop/avatars", "image");

    // Delete old avatar if exists
    if (req.user.avatarPublicId) {
      await deleteFromCloudinary(req.user.avatarPublicId);
    }

    await req.user.updateOne({ avatar: result.secure_url, avatarPublicId: result.public_id });

    return successResponse(res, 200, "Avatar updated", { avatarUrl: result.secure_url });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPLOAD RESUME ────────────────────────────────────────────────────────
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No PDF file provided");

    const result = await uploadToCloudinary(req.file.buffer, "hireloop/resumes", "raw");

    const profile = await Student.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl: result.secure_url, resumePublicId: result.public_id },
      { new: true }
    );

    return successResponse(res, 200, "Resume uploaded", { resumeUrl: result.secure_url });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, "Student profile not found");

    const applications = await Application.find({ student: student._id });

    const total = applications.length;

    // Count by stage groups
    const shortlistedStages = ["Shortlisted", "Aptitude Test", "Coding Test", "Group Discussion", "Technical Interview", "HR Interview", "Management Round", "Offer Received", "Joined"];
    const interviewStages = ["Technical Interview", "HR Interview", "Management Round"];
    const offerStages = ["Offer Received", "Joined"];

    const shortlisted = applications.filter((a) => shortlistedStages.includes(a.currentStage)).length;
    const interviews  = applications.filter((a) => interviewStages.includes(a.currentStage)).length;
    const offers      = applications.filter((a) => offerStages.includes(a.currentStage)).length;
    const rejected    = applications.filter((a) => a.currentStage === "Rejected").length;

    // By stage breakdown for chart
    const byStage = applications.reduce((acc, app) => {
      acc[app.currentStage] = (acc[app.currentStage] || 0) + 1;
      return acc;
    }, {});

    return successResponse(res, 200, "Dashboard stats fetched", {
      total, shortlisted, interviews, offers, rejected, byStage,
      placementStatus: student.placementStatus,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── SAVE / UNSAVE EXPERIENCE ─────────────────────────────────────────────
const saveExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Student.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res, 404, "Profile not found");

    if (profile.savedExperiences.includes(id)) {
      return errorResponse(res, 400, "Experience already saved");
    }

    profile.savedExperiences.push(id);
    await profile.save();
    return successResponse(res, 200, "Experience saved");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const unsaveExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Student.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res, 404, "Profile not found");

    profile.savedExperiences = profile.savedExperiences.filter(
      (expId) => expId.toString() !== id
    );
    await profile.save();
    return successResponse(res, 200, "Experience removed from saved");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const getSavedExperiences = async (req, res) => {
  try {
    const profile = await Student.findOne({ user: req.user._id }).populate({
      path: "savedExperiences",
      populate: { path: "company", select: "name logo" },
    });
    if (!profile) return errorResponse(res, 404, "Profile not found");
    return successResponse(res, 200, "Saved experiences fetched", profile.savedExperiences);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    return successResponse(res, 200, "Notifications fetched", notifications);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    return successResponse(res, 200, "Notification marked as read");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return successResponse(res, 200, "All notifications marked as read");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getProfile, updateProfile, uploadAvatar, uploadResume,
  getDashboardStats, saveExperience, unsaveExperience, getSavedExperiences,
  getNotifications, markNotificationRead, markAllNotificationsRead,
};
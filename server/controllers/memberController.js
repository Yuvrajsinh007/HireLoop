const User             = require("../models/User");
const MemberProfile    = require("../models/MemberProfile");
const Application      = require("../models/Application");
const Notification     = require("../models/Notification");
const EmploymentHistory= require("../models/EmploymentHistory");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter, verifyTenantOwnership } = require("../middleware/tenantMiddleware");

// ─── GET MY PROFILE ────────────────────────────────────────────────────────
// GET /api/members/profile
const getProfile = async (req, res) => {
  try {
    const profile = await MemberProfile.findOne({ user: req.user._id })
      .populate("user",         "name email avatar role academicStatus placementStatus employmentStatus isEmailVerified alternateEmail")
      .populate("institution",  "name shortName logo")
      .populate("academicUnit", "name code")
      .populate("program",      "name code degreeType durationYears");

    if (!profile) return errorResponse(res, 404, "Profile not found");
    return successResponse(res, 200, "Profile fetched", profile);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE MY PROFILE ─────────────────────────────────────────────────────
// PUT /api/members/profile
const updateProfile = async (req, res) => {
  try {
    const {
      rollNumber, academicUnit, program, enrollmentYear, graduationYear,
      cgpa, activeBacklogs, skills, linkedIn, github, portfolio, bio,
      isAvailableForMentorship, mentorshipTopics,
      currentCompany, currentRole, currentCTC,
      alternateEmail,
    } = req.body;

    // Update MemberProfile
    const profile = await MemberProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        rollNumber, academicUnit, program, enrollmentYear, graduationYear,
        cgpa, activeBacklogs, skills, linkedIn, github, portfolio, bio,
        isAvailableForMentorship, mentorshipTopics,
        currentCompany, currentRole, currentCTC,
      },
      { new: true, runValidators: true }
    )
      .populate("academicUnit", "name")
      .populate("program", "name degreeType");

    if (!profile) return errorResponse(res, 404, "Profile not found");

    // Update alternate email on User if provided
    if (alternateEmail !== undefined) {
      await User.findByIdAndUpdate(req.user._id, { alternateEmail });
    }

    return successResponse(res, 200, "Profile updated successfully", profile);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPLOAD AVATAR ────────────────────────────────────────────────────────
// POST /api/members/avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No image file provided");

    const result = await uploadToCloudinary(req.file.buffer, "hireloop/avatars", "image");

    if (req.user.avatarPublicId) {
      await deleteFromCloudinary(req.user.avatarPublicId).catch(() => {});
    }

    await User.findByIdAndUpdate(req.user._id, {
      avatar:          result.secure_url,
      avatarPublicId:  result.public_id,
    });

    return successResponse(res, 200, "Avatar updated", { avatarUrl: result.secure_url });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPLOAD RESUME ────────────────────────────────────────────────────────
// POST /api/members/resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No PDF file provided");

    const result = await uploadToCloudinary(req.file.buffer, "hireloop/resumes", "raw");

    const profile = await MemberProfile.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl: result.secure_url, resumePublicId: result.public_id },
      { new: true }
    );

    return successResponse(res, 200, "Resume uploaded", { resumeUrl: result.secure_url });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── STUDENT DASHBOARD STATS ───────────────────────────────────────────────
// GET /api/members/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const applications = await Application.find({
      student:     req.user._id,
      institution: req.institutionId,
    });

    const total = applications.length;

    const shortlistedStages = [
      "Shortlisted","Aptitude Test","Coding Test","Group Discussion",
      "Technical Interview","HR Interview","Management Round","Offer Received","Joined",
    ];
    const interviewStages = ["Technical Interview","HR Interview","Management Round"];
    const offerStages     = ["Offer Received","Joined"];

    const shortlisted = applications.filter((a) => shortlistedStages.includes(a.currentStage)).length;
    const interviews  = applications.filter((a) => interviewStages.includes(a.currentStage)).length;
    const offers      = applications.filter((a) => offerStages.includes(a.currentStage)).length;
    const rejected    = applications.filter((a) => a.currentStage === "Rejected").length;

    const byStage = applications.reduce((acc, app) => {
      acc[app.currentStage] = (acc[app.currentStage] || 0) + 1;
      return acc;
    }, {});

    return successResponse(res, 200, "Dashboard stats fetched", {
      total, shortlisted, interviews, offers, rejected, byStage,
      placementStatus:  req.user.placementStatus,
      academicStatus:   req.user.academicStatus,
      employmentStatus: req.user.employmentStatus,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ALUMNI DASHBOARD STATS ────────────────────────────────────────────────
// GET /api/members/alumni-stats
const getAlumniStats = async (req, res) => {
  try {
    if (req.user.academicStatus !== "GRADUATED") {
      return errorResponse(res, 403, "Alumni only endpoint");
    }

    const profile = await MemberProfile.findOne({ user: req.user._id });
    const empHistory = await EmploymentHistory.find({ user: req.user._id })
      .populate("company", "name logo")
      .sort({ isCurrent: -1, startDate: -1 });

    return successResponse(res, 200, "Alumni stats fetched", {
      profile,
      employmentHistory: empHistory,
      isAvailableForMentorship: profile?.isAvailableForMentorship || false,
      mentorshipTopics:         profile?.mentorshipTopics || [],
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── EMPLOYMENT HISTORY (alumni) ───────────────────────────────────────────
// GET /api/members/employment
const getEmploymentHistory = async (req, res) => {
  try {
    const history = await EmploymentHistory.find({ user: req.user._id })
      .populate("company", "name logo industry")
      .sort({ isCurrent: -1, startDate: -1 });

    return successResponse(res, 200, "Employment history fetched", history);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/members/employment
const addEmployment = async (req, res) => {
  try {
    const {
      companyName, company, jobTitle, employmentType,
      ctc, stipend, startDate, endDate, isCurrent,
      isViaCampus, description,
    } = req.body;

    if (!companyName) return errorResponse(res, 400, "Company name is required");

    // If marking as current, clear other current entries
    if (isCurrent) {
      await EmploymentHistory.updateMany(
        { user: req.user._id, isCurrent: true },
        { isCurrent: false }
      );

      // Update user's current employment info
      await User.findByIdAndUpdate(req.user._id, {
        employmentStatus: employmentType === "Intern" ? "INTERN" : "WORKING",
      });

      await MemberProfile.findOneAndUpdate(
        { user: req.user._id },
        { currentCompany: companyName, currentRole: jobTitle, currentCTC: ctc }
      );
    }

    const entry = await EmploymentHistory.create({
      user:           req.user._id,
      institution:    req.institutionId,
      companyName,
      company:        company || null,
      jobTitle,
      employmentType,
      ctc,
      stipend,
      startDate,
      endDate,
      isCurrent:      isCurrent || false,
      isViaCampus:    isViaCampus || false,
      description,
    });

    return successResponse(res, 201, "Employment added", entry);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// PUT /api/members/employment/:id
const updateEmployment = async (req, res) => {
  try {
    const entry = await EmploymentHistory.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!entry) return errorResponse(res, 404, "Employment record not found");
    return successResponse(res, 200, "Employment updated", entry);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// DELETE /api/members/employment/:id
const deleteEmployment = async (req, res) => {
  try {
    const entry = await EmploymentHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!entry) return errorResponse(res, 404, "Employment record not found");
    return successResponse(res, 200, "Employment record deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── SAVE / UNSAVE EXPERIENCE ─────────────────────────────────────────────
// POST /api/members/save-experience/:id
const saveExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await MemberProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res, 404, "Profile not found");

    if (profile.savedExperiences.includes(id))
      return errorResponse(res, 400, "Experience already saved");

    profile.savedExperiences.push(id);
    await profile.save();
    return successResponse(res, 200, "Experience saved");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// DELETE /api/members/save-experience/:id
const unsaveExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await MemberProfile.findOne({ user: req.user._id });
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

// GET /api/members/saved-experiences
const getSavedExperiences = async (req, res) => {
  try {
    const profile = await MemberProfile.findOne({ user: req.user._id }).populate({
      path:     "savedExperiences",
      populate: { path: "company", select: "name logo" },
    });
    if (!profile) return errorResponse(res, 404, "Profile not found");
    return successResponse(res, 200, "Saved experiences fetched", profile.savedExperiences);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
// GET /api/members/notifications
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

// PUT /api/members/notifications/:id/read
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

// PUT /api/members/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    return successResponse(res, 200, "All notifications marked as read");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getProfile, updateProfile, uploadAvatar, uploadResume,
  getDashboardStats, getAlumniStats,
  getEmploymentHistory, addEmployment, updateEmployment, deleteEmployment,
  saveExperience, unsaveExperience, getSavedExperiences,
  getNotifications, markNotificationRead, markAllNotificationsRead,
};
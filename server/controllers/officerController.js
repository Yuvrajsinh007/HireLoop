const User        = require("../models/User");
const Student     = require("../models/Student");
const Application = require("../models/Application");
const Company     = require("../models/Company");
const Experience  = require("../models/Experience");
const Notification= require("../models/Notification");
const { sendPlacementAlertEmail } = require("../utils/sendEmail");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── OFFICER DASHBOARD STATS ──────────────────────────────────────────────
// GET /api/officer/dashboard
const getDashboard = async (req, res) => {
  try {
    const [
      totalStudents, placedStudents,
      totalCompanies, upcomingDrives,
      totalExperiences, recentApplications,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ placementStatus: "placed" }),
      Company.countDocuments({ isActive: true }),
      Company.countDocuments({ driveStatus: "upcoming" }),
      Experience.countDocuments(),
      Application.find({ currentStage: { $in: ["Offer Received", "Joined"] } })
        .populate("student", "user")
        .populate("company", "name")
        .sort({ updatedAt: -1 })
        .limit(10),
    ]);

    // Branch-wise placement stats
    const branchStats = await Student.aggregate([
      {
        $group: {
          _id:   "$branch",
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ["$placementStatus", "placed"] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly placement trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Application.aggregate([
      {
        $match: {
          currentStage: { $in: ["Offer Received", "Joined"] },
          updatedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  "$updatedAt" },
            month: { $month: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const placementRate = totalStudents > 0
      ? Math.round((placedStudents / totalStudents) * 100)
      : 0;

    return successResponse(res, 200, "Officer dashboard stats", {
      totalStudents,
      placedStudents,
      placementRate,
      totalCompanies,
      upcomingDrives,
      totalExperiences,
      branchStats,
      monthlyTrend,
      recentPlacements: recentApplications,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET ALL STUDENTS ─────────────────────────────────────────────────────
// GET /api/officer/students
const getStudents = async (req, res) => {
  try {
    const { branch, placementStatus, page = 1, limit = 20 } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (branch)          filter.branch          = branch;
    if (placementStatus) filter.placementStatus = placementStatus;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate("user", "name email avatar isEmailVerified createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Student.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Students fetched", {
      students, total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── SEND DRIVE ALERT EMAIL ───────────────────────────────────────────────
// POST /api/officer/send-drive-alert
const sendDriveAlert = async (req, res) => {
  try {
    const { companyId, driveDate, branches } = req.body;
    if (!companyId || !driveDate) {
      return errorResponse(res, 400, "Company and drive date are required");
    }

    const company = await Company.findById(companyId);
    if (!company) return errorResponse(res, 404, "Company not found");

    // Get eligible students
    const studentFilter = {};
    if (branches?.length) studentFilter.branch = { $in: branches };

    const students = await Student.find(studentFilter)
      .populate("user", "name email");

    let sent = 0;
    const errors = [];

    for (const student of students) {
      if (!student.user?.email) continue;
      try {
        await sendPlacementAlertEmail({
          to:          student.user.email,
          name:        student.user.name,
          companyName: company.name,
          driveDate:   new Date(driveDate).toDateString(),
        });

        await Notification.create({
          recipient: student.user._id,
          type:      "new_drive",
          title:     `${company.name} is visiting campus!`,
          message:   `Drive scheduled on ${new Date(driveDate).toDateString()}`,
          link:      `/companies/${company._id}`,
          relatedCompany: company._id,
        });

        sent++;
      } catch (e) {
        errors.push(student.user.email);
      }
    }

    return successResponse(res, 200, `Drive alert sent to ${sent} students`, {
      sent,
      failed: errors.length,
      failedEmails: errors,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET PLACEMENT REPORT ─────────────────────────────────────────────────
// GET /api/officer/reports
const getPlacementReport = async (req, res) => {
  try {
    const { year } = req.query;

    const filter = {};
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate   = new Date(`${parseInt(year) + 1}-01-01`);
      filter.updatedAt = { $gte: startDate, $lt: endDate };
      filter.currentStage = { $in: ["Offer Received", "Joined"] };
    }

    const placements = await Application.find(filter)
      .populate({
        path:     "student",
        populate: { path: "user", select: "name email" },
      })
      .populate("company", "name domain")
      .sort({ updatedAt: -1 });

    const totalPlaced = placements.length;
    const avgCTC = placements.reduce((acc, p) => acc + (p.ctcOffered || 0), 0) / (totalPlaced || 1);
    const maxCTC = Math.max(...placements.map((p) => p.ctcOffered || 0));

    const companyBreakdown = placements.reduce((acc, p) => {
      const name = p.company?.name || "Unknown";
      acc[name]  = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return successResponse(res, 200, "Placement report fetched", {
      totalPlaced,
      avgCTC:    Math.round(avgCTC * 10) / 10,
      maxCTC,
      companyBreakdown,
      placements,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ADMIN: GET ALL USERS ─────────────────────────────────────────────────
// GET /api/officer/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (role)   filter.role  = role;
    if (search) filter.$or   = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Users fetched", {
      users, total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ADMIN: UPDATE USER ROLE / STATUS ────────────────────────────────────
// PUT /api/officer/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role !== undefined && { role }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    ).select("-password");

    if (!user) return errorResponse(res, 404, "User not found");
    return successResponse(res, 200, "User updated", user);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ADMIN: VERIFY EXPERIENCE ─────────────────────────────────────────────
// PUT /api/officer/admin/experiences/:id/verify
const verifyExperience = async (req, res) => {
  try {
    const exp = await Experience.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!exp) return errorResponse(res, 404, "Experience not found");
    return successResponse(res, 200, "Experience verified", exp);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getDashboard, getStudents, sendDriveAlert,
  getPlacementReport, getAllUsers, updateUser, verifyExperience,
};
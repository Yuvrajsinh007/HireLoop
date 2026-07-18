const User           = require("../models/User");
const MemberProfile  = require("../models/MemberProfile");
const Application    = require("../models/Application");
const Company        = require("../models/Company");
const Experience     = require("../models/Experience");
const PlacementDrive = require("../models/PlacementDrive");
const GuidanceRequest= require("../models/GuidanceRequest");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter } = require("../middleware/tenantMiddleware");

// ─── OFFICER DASHBOARD STATS ──────────────────────────────────────────────
// GET /api/officer/dashboard
const getDashboard = async (req, res) => {
  try {
    const tFilter = { institution: req.institutionId };

    const [
      totalMembers,
      currentStudents,
      placedStudents,
      alumni,
      totalDrives,
      activeDrives,
      totalExperiences,
      pendingGuidance,
    ] = await Promise.all([
      User.countDocuments({ ...tFilter, role: "member", isActive: true }),
      User.countDocuments({ ...tFilter, role: "member", academicStatus: { $in: ["ENROLLED","FINAL_YEAR"] } }),
      User.countDocuments({ ...tFilter, role: "member", placementStatus: "PLACED" }),
      User.countDocuments({ ...tFilter, role: "member", academicStatus: "GRADUATED" }),
      PlacementDrive.countDocuments(tFilter),
      PlacementDrive.countDocuments({ ...tFilter, status: { $in: ["UPCOMING","ACTIVE"] } }),
      Experience.countDocuments({ ...tFilter, isVerified: true }),
      GuidanceRequest.countDocuments({ ...tFilter, status: "PENDING_REVIEW" }),
    ]);

    const placementRate = currentStudents > 0
      ? Math.round((placedStudents / currentStudents) * 100)
      : 0;

    // Program-wise placement stats
    const programStats = await MemberProfile.aggregate([
      { $match: { institution: req.institutionId } },
      {
        $lookup: {
          from:         "users",
          localField:   "user",
          foreignField: "_id",
          as:           "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $match: {
          "userInfo.role":           "member",
          "userInfo.academicStatus": { $in: ["ENROLLED","FINAL_YEAR"] },
        },
      },
      {
        $group: {
          _id:    "$program",
          total:  { $sum: 1 },
          placed: {
            $sum: {
              $cond: [{ $eq: ["$userInfo.placementStatus", "PLACED"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Populate program names
    const Program = require("../models/Program");
    const programIds = programStats.map((p) => p._id).filter(Boolean);
    const programs   = await Program.find({ _id: { $in: programIds } }).select("name code");
    const programMap = {};
    programs.forEach((p) => { programMap[p._id.toString()] = p.name; });

    const programStatsFormatted = programStats.map((p) => ({
      program: p._id ? programMap[p._id.toString()] || "Unknown" : "Not Set",
      total:   p.total,
      placed:  p.placed,
      rate:    p.total > 0 ? Math.round((p.placed / p.total) * 100) : 0,
    }));

    // Monthly placement trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Application.aggregate([
      {
        $match: {
          institution:  req.institutionId,
          currentStage: { $in: ["Offer Received","Joined"] },
          updatedAt:    { $gte: sixMonthsAgo },
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

    // Recent placements
    const recentPlacements = await Application.find({
      institution:  req.institutionId,
      currentStage: { $in: ["Offer Received","Joined"] },
    })
      .populate("student", "name email avatar")
      .populate("company", "name logo")
      .sort({ updatedAt: -1 })
      .limit(8);

    return successResponse(res, 200, "Officer dashboard stats", {
      totalMembers,
      currentStudents,
      placedStudents,
      alumni,
      placementRate,
      totalDrives,
      activeDrives,
      totalExperiences,
      pendingGuidance,
      programStats: programStatsFormatted,
      monthlyTrend,
      recentPlacements,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET ALL MEMBERS (students + alumni) ──────────────────────────────────
// GET /api/officer/members
const getMembers = async (req, res) => {
  try {
    const {
      academicStatus, placementStatus, program,
      academicUnit, graduationYear, search,
      page = 1, limit = 20,
    } = req.query;

    const skip   = (parseInt(page) - 1) * parseInt(limit);

    // Build user filter
    const userFilter = { institution: req.institutionId, role: "member", isActive: true };
    if (academicStatus)  userFilter.academicStatus  = academicStatus;
    if (placementStatus) userFilter.placementStatus = placementStatus;
    if (search) {
      userFilter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(userFilter).select("_id");
    const userIds = users.map((u) => u._id);

    // Build profile filter
    const profileFilter = { user: { $in: userIds }, institution: req.institutionId };
    if (program)       profileFilter.program       = program;
    if (academicUnit)  profileFilter.academicUnit  = academicUnit;
    if (graduationYear) profileFilter.graduationYear = parseInt(graduationYear);

    const [profiles, total] = await Promise.all([
      MemberProfile.find(profileFilter)
        .populate("user",         "name email avatar academicStatus placementStatus employmentStatus isEmailVerified createdAt")
        .populate("program",      "name code degreeType")
        .populate("academicUnit", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      MemberProfile.countDocuments(profileFilter),
    ]);

    return successResponse(res, 200, "Members fetched", {
      members: profiles,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET SINGLE MEMBER (officer can see full profile) ─────────────────────
// GET /api/officer/members/:userId
const getMember = async (req, res) => {
  try {
    const profile = await MemberProfile.findOne({
      user:        req.params.userId,
      institution: req.institutionId,
    })
      .populate("user",         "name email avatar academicStatus placementStatus employmentStatus isEmailVerified alternateEmail createdAt lastLogin")
      .populate("program",      "name code degreeType durationYears")
      .populate("academicUnit", "name code");

    if (!profile) return errorResponse(res, 404, "Member not found in your institution");

    const applications = await Application.find({
      student:     req.params.userId,
      institution: req.institutionId,
    })
      .populate("company", "name logo")
      .sort({ updatedAt: -1 })
      .limit(10);

    return successResponse(res, 200, "Member fetched", { profile, applications });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE MEMBER STATUS (officer can update academic/placement status) ──
// PUT /api/officer/members/:userId/status
const updateMemberStatus = async (req, res) => {
  try {
    const { academicStatus, placementStatus, employmentStatus } = req.body;

    // Verify member belongs to same institution
    const member = await User.findOne({
      _id:         req.params.userId,
      institution: req.institutionId,
      role:        "member",
    });
    if (!member) return errorResponse(res, 404, "Member not found in your institution");

    const updates = {};
    if (academicStatus)  updates.academicStatus  = academicStatus;
    if (placementStatus) updates.placementStatus = placementStatus;
    if (employmentStatus) updates.employmentStatus = employmentStatus;

    const updated = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    ).select("-password");

    return successResponse(res, 200, "Member status updated", updated);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GRADUATE BATCH (bulk transition students → alumni) ───────────────────
// POST /api/officer/graduate-batch
const graduateBatch = async (req, res) => {
  try {
    const { graduationYear, programId } = req.body;
    if (!graduationYear)
      return errorResponse(res, 400, "Graduation year is required");

    // Find all profiles matching the batch
    const profileFilter = { institution: req.institutionId, graduationYear: parseInt(graduationYear) };
    if (programId) profileFilter.program = programId;

    const profiles  = await MemberProfile.find(profileFilter).select("user");
    const userIds   = profiles.map((p) => p.user);

    if (userIds.length === 0)
      return errorResponse(res, 404, "No students found for this graduation year");

    // Update their academicStatus to GRADUATED
    const result = await User.updateMany(
      {
        _id:            { $in: userIds },
        institution:    req.institutionId,
        role:           "member",
        academicStatus: { $in: ["ENROLLED","FINAL_YEAR"] },
      },
      {
        academicStatus:  "GRADUATED",
        employmentStatus: "SEEKING",
      }
    );

    return successResponse(res, 200, `${result.modifiedCount} students graduated successfully`, {
      graduated: result.modifiedCount,
      year:      graduationYear,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── PLACEMENT REPORT ─────────────────────────────────────────────────────
// GET /api/officer/reports
const getPlacementReport = async (req, res) => {
  try {
    const { year } = req.query;
    const filter = tenantFilter(req, {});

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate   = new Date(`${parseInt(year) + 1}-01-01`);
      filter.updatedAt     = { $gte: startDate, $lt: endDate };
      filter.currentStage  = { $in: ["Offer Received","Joined"] };
    }

    const placements = await Application.find(filter)
      .populate("student", "name email avatar")
      .populate("company", "name logo industry")
      .sort({ updatedAt: -1 });

    const totalPlaced = placements.length;
    const avgCTC = placements.reduce((acc, p) => acc + (p.ctcOffered || 0), 0) / (totalPlaced || 1);
    const maxCTC = Math.max(0, ...placements.map((p) => p.ctcOffered || 0));

    const companyBreakdown = placements.reduce((acc, p) => {
      const name  = p.company?.name || "Unknown";
      acc[name]   = (acc[name] || 0) + 1;
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

// ─── GET ALL STAFF (for admin view) ───────────────────────────────────────
// GET /api/officer/staff
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({
      institution: req.institutionId,
      role:        { $in: ["officer","collegeAdmin"] },
    }).select("-password").sort({ createdAt: -1 });

    return successResponse(res, 200, "Staff fetched", staff);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE ANY USER (admin only within institution) ──────────────────────
// PUT /api/officer/users/:id
const updateUser = async (req, res) => {
  try {
    const { role, isActive, academicStatus, placementStatus } = req.body;

    // Ensure user is in same institution
    const target = await User.findOne({
      _id:         req.params.id,
      institution: req.institutionId,
    });
    if (!target) return errorResponse(res, 404, "User not found in your institution");

    // Prevent promoting to superAdmin
    if (role === "superAdmin")
      return errorResponse(res, 403, "Cannot assign superAdmin role");

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(role !== undefined            && { role }),
        ...(isActive !== undefined        && { isActive }),
        ...(academicStatus !== undefined  && { academicStatus }),
        ...(placementStatus !== undefined && { placementStatus }),
      },
      { new: true }
    ).select("-password");

    return successResponse(res, 200, "User updated", updated);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getDashboard,
  getMembers, getMember, updateMemberStatus,
  graduateBatch,
  getPlacementReport,
  getStaff, updateUser,
};
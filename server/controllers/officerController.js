const mongoose       = require("mongoose");
const User           = require("../models/User");
const MemberProfile  = require("../models/MemberProfile");
const Application    = require("../models/Application");
const Company        = require("../models/Company");
const Experience     = require("../models/Experience");
const PlacementDrive = require("../models/PlacementDrive");
const Program        = require("../models/Program");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter } = require("../middleware/tenantMiddleware");

// ─── OFFICER DASHBOARD STATS ──────────────────────────────────────────────
// GET /api/officer/dashboard
const getDashboard = async (req, res) => {
  try {
    const tFilter = { institution: req.institutionId };
    // aggregate() does not auto-cast to ObjectId, so cast manually
    const instId = new mongoose.Types.ObjectId(req.institutionId);

    const [
      totalMembers,
      currentStudents,
      placedStudents,
      graduatedStudents,
      totalDrives,
      activeDrives,
      totalExperiences,
    ] = await Promise.all([
      User.countDocuments({ ...tFilter, role: "member", isActive: true }),
      User.countDocuments({ ...tFilter, role: "member", academicStatus: { $in: ["ENROLLED","FINAL_YEAR"] } }),
      User.countDocuments({ ...tFilter, role: "member", placementStatus: "PLACED" }),
      User.countDocuments({ ...tFilter, role: "member", academicStatus: "GRADUATED" }),
      PlacementDrive.countDocuments(tFilter),
      PlacementDrive.countDocuments({ ...tFilter, status: { $in: ["UPCOMING","ACTIVE"] } }),
      Experience.countDocuments({ ...tFilter, isVerified: true }),
    ]);

    const placementRate = currentStudents > 0
      ? Math.round((placedStudents / currentStudents) * 100)
      : 0;

    // Program-wise placement stats
    const programStats = await MemberProfile.aggregate([
      { $match: { institution: instId } },
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
          institution:  instId,
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
      graduatedStudents,
      placementRate,
      totalDrives,
      activeDrives,
      totalExperiences,
      programStats: programStatsFormatted,
      monthlyTrend,
      recentPlacements,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET ALL MEMBERS (students) ───────────────────────────────────────────
// GET /api/officer/members
const getMembers = async (req, res) => {
  try {
    const {
      academicStatus, placementStatus, program,
      academicUnit, graduationYear, search,
      page = 1, limit = 20,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

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

    const users   = await User.find(userFilter).select("_id");
    const userIds = users.map((u) => u._id);

    // Build profile filter
    const profileFilter = { user: { $in: userIds }, institution: req.institutionId };
    if (program)        profileFilter.program        = program;
    if (academicUnit)   profileFilter.academicUnit   = academicUnit;
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
      members:    profiles,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET SINGLE MEMBER ────────────────────────────────────────────────────
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

// ─── UPDATE MEMBER STATUS ─────────────────────────────────────────────────
// PUT /api/officer/members/:userId/status
const updateMemberStatus = async (req, res) => {
  try {
    const { academicStatus, placementStatus, employmentStatus } = req.body;

    const member = await User.findOne({
      _id:         req.params.userId,
      institution: req.institutionId,
      role:        "member",
    });
    if (!member) return errorResponse(res, 404, "Member not found in your institution");

    const updates = {};
    if (academicStatus)   updates.academicStatus   = academicStatus;
    if (placementStatus)  updates.placementStatus  = placementStatus;
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

// ─── GRADUATE BATCH ───────────────────────────────────────────────────────
// POST /api/officer/graduate-batch
// Body: { graduationYear, program?, academicUnit?, dryRun? }
const graduateBatch = async (req, res) => {
  try {
    const { graduationYear, program, academicUnit, dryRun = false } = req.body;

    if (!graduationYear)
      return errorResponse(res, 400, "graduationYear is required");

    const profileFilter = {
      institution:    req.institutionId,
      graduationYear: parseInt(graduationYear),
    };
    if (program)      profileFilter.program      = program;
    if (academicUnit) profileFilter.academicUnit = academicUnit;

    const profiles = await MemberProfile.find(profileFilter).select("user");
    const userIds  = profiles.map((p) => p.user);

    if (userIds.length === 0)
      return successResponse(res, 200, "No matching students found", {
        matched:  0,
        modified: 0,
      });

    const userFilter = {
      _id:            { $in: userIds },
      institution:    req.institutionId,
      role:           "member",
      academicStatus: { $ne: "GRADUATED" },
    };

    if (dryRun) {
      const count = await User.countDocuments(userFilter);
      return successResponse(res, 200, "Dry run: students that would be graduated", {
        matched:  count,
        modified: 0,
        dryRun:   true,
      });
    }

    const result = await User.updateMany(userFilter, {
      $set: { academicStatus: "GRADUATED" },
    });

    return successResponse(res, 200, "Batch graduated successfully", {
      matched:  result.matchedCount,
      modified: result.modifiedCount,
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

    // Always restrict to placed stages (previously only applied when year was set)
    filter.currentStage = { $in: ["Offer Received","Joined"] };

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate   = new Date(`${parseInt(year) + 1}-01-01`);
      filter.updatedAt = { $gte: startDate, $lt: endDate };
    }

    const placements = await Application.find(filter)
      .populate("student", "name email avatar")
      .populate("company", "name logo industry")
      .sort({ updatedAt: -1 });

    const totalPlaced = placements.length;
    const avgCTC = placements.reduce((acc, p) => acc + (p.ctcOffered || 0), 0) / (totalPlaced || 1);
    const maxCTC = Math.max(0, ...placements.map((p) => p.ctcOffered || 0));

    const companyBreakdown = placements.reduce((acc, p) => {
      const name = p.company?.name || "Unknown";
      acc[name]  = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return successResponse(res, 200, "Placement report fetched", {
      totalPlaced,
      avgCTC: Math.round(avgCTC * 10) / 10,
      maxCTC,
      companyBreakdown,
      placements,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET ALL STAFF ────────────────────────────────────────────────────────
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

    const target = await User.findOne({
      _id:         req.params.id,
      institution: req.institutionId,
    });
    if (!target) return errorResponse(res, 404, "User not found in your institution");

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

// ─── EXPORT STUDENTS ────────────────────────────────────────────────────────
// GET /api/officer/export/students
const exportStudents = async (req, res) => {
  try {
    const userFilter = { institution: req.institutionId, role: "member" };
    const users = await User.find(userFilter).select("name email academicStatus placementStatus");
    
    const userIds = users.map(u => u._id);
    const profiles = await MemberProfile.find({ user: { $in: userIds } })
      .populate("program", "name code")
      .populate("academicUnit", "code");
      
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    let csv = "Name,Email,Academic Status,Placement Status,Program,Academic Unit,CGPA,Active Backlogs\n";
    users.forEach(u => {
      const p = profileMap[u._id.toString()] || {};
      const programCode = p.program ? p.program.code : "";
      const unitCode = p.academicUnit ? p.academicUnit.code : "";
      csv += `"${u.name || ""}","${u.email || ""}","${u.academicStatus || ""}","${u.placementStatus || ""}","${programCode}","${unitCode}","${p.cgpa || ""}","${p.activeBacklogs || 0}"\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("students.csv");
    return res.send(csv);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── EXPORT DRIVE APPLICATIONS ─────────────────────────────────────────────
// GET /api/officer/export/drives/:id/applications
const exportDriveApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      institution: req.institutionId,
      drive: req.params.id
    })
      .populate("student", "name email academicStatus placementStatus")
      .populate("company", "name");

    let csv = "Student Name,Email,Academic Status,Placement Status,Company,Stage,Applied Date\n";
    applications.forEach(a => {
      const s = a.student || {};
      const c = a.company || {};
      csv += `"${s.name || ""}","${s.email || ""}","${s.academicStatus || ""}","${s.placementStatus || ""}","${c.name || ""}","${a.currentStage || ""}","${new Date(a.createdAt).toISOString()}"\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("applications.csv");
    return res.send(csv);
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
  exportStudents, exportDriveApplications,
};
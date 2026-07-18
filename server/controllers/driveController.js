const PlacementDrive = require("../models/PlacementDrive");
const Application    = require("../models/Application");
const MemberProfile  = require("../models/MemberProfile");
const Notification   = require("../models/Notification");
const User           = require("../models/User");
const { sendPlacementAlertEmail } = require("../utils/sendEmail");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter, verifyTenantOwnership } = require("../middleware/tenantMiddleware");

// ─── GET ALL DRIVES (tenant-scoped) ──────────────────────────────────────
// GET /api/drives
const getDrives = async (req, res) => {
  try {
    const { status, page = 1, limit = 12, sort = "-driveDate" } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = tenantFilter(req, {});

    if (status) filter.status = status;

    const [drives, total] = await Promise.all([
      PlacementDrive.find(filter)
        .populate("company",           "name logo industry website")
        .populate("eligiblePrograms",  "name code degreeType")
        .populate("createdBy",         "name")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      PlacementDrive.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Drives fetched", {
      drives,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET SINGLE DRIVE ─────────────────────────────────────────────────────
// GET /api/drives/:id
const getDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findOne(
      tenantFilter(req, { _id: req.params.id })
    )
      .populate("company",          "name logo industry website description headquarters")
      .populate("eligiblePrograms", "name code degreeType academicUnit")
      .populate("createdBy",        "name");

    if (!drive) return errorResponse(res, 404, "Drive not found");
    return successResponse(res, 200, "Drive fetched", drive);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET ELIGIBLE DRIVES FOR CURRENT STUDENT ─────────────────────────────
// GET /api/drives/eligible
const getEligibleDrives = async (req, res) => {
  try {
    const profile = await MemberProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res, 404, "Profile not found");

    const filter = tenantFilter(req, {
      status: { $in: ["UPCOMING", "ACTIVE"] },
    });

    // Filter by program eligibility if student has a program set
    if (profile.program) {
      filter.$or = [
        { eligiblePrograms: { $size: 0 } },       // empty = all programs eligible
        { eligiblePrograms: profile.program },     // student's program in eligible list
      ];
    }

    // Filter by CGPA
    if (profile.cgpa) {
      filter.$and = [
        { $or: [{ minCGPA: { $lte: profile.cgpa } }, { minCGPA: 0 }] },
      ];
    }

    // Filter by graduation year
    if (profile.graduationYear) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { graduationYears: { $size: 0 } },
          { graduationYears: profile.graduationYear },
        ],
      });
    }

    const drives = await PlacementDrive.find(filter)
      .populate("company",          "name logo industry")
      .populate("eligiblePrograms", "name code")
      .sort({ driveDate: 1 });

    return successResponse(res, 200, "Eligible drives fetched", drives);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── CREATE DRIVE (officer/admin) ─────────────────────────────────────────
// POST /api/drives
const createDrive = async (req, res) => {
  try {
    const {
      company, title, driveType, academicYear,
      driveDate, applicationDeadline,
      eligiblePrograms, minCGPA, maxBacklogs, graduationYears,
      eligibilityCriteria, roles, rounds, skillsRequired,
      description, resourceLinks,
    } = req.body;

    if (!company || !title)
      return errorResponse(res, 400, "Company and title are required");

    const drive = await PlacementDrive.create({
      institution: req.institutionId,
      company, title, driveType, academicYear,
      driveDate, applicationDeadline,
      eligiblePrograms: eligiblePrograms || [],
      minCGPA:          minCGPA          || 0,
      maxBacklogs:      maxBacklogs      || 0,
      graduationYears:  graduationYears  || [],
      eligibilityCriteria,
      roles:            roles            || [],
      rounds:           rounds           || [],
      skillsRequired:   skillsRequired   || [],
      description,
      resourceLinks:    resourceLinks    || [],
      createdBy:        req.user._id,
    });

    await drive.populate("company", "name logo");
    return successResponse(res, 201, "Drive created successfully", drive);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE DRIVE (officer/admin) ────────────────────────────────────────
// PUT /api/drives/:id
const updateDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findOneAndUpdate(
      tenantFilter(req, { _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    ).populate("company", "name logo");

    if (!drive) return errorResponse(res, 404, "Drive not found");
    return successResponse(res, 200, "Drive updated", drive);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DELETE DRIVE (admin only) ────────────────────────────────────────────
// DELETE /api/drives/:id
const deleteDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findOneAndDelete(
      tenantFilter(req, { _id: req.params.id })
    );
    if (!drive) return errorResponse(res, 404, "Drive not found");
    return successResponse(res, 200, "Drive deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── SEND DRIVE ALERT EMAIL ───────────────────────────────────────────────
// POST /api/drives/:id/send-alert
const sendDriveAlert = async (req, res) => {
  try {
    const drive = await PlacementDrive.findOne(
      tenantFilter(req, { _id: req.params.id })
    ).populate("company", "name");

    if (!drive) return errorResponse(res, 404, "Drive not found");

    // Get eligible members
    const memberFilter = { institution: req.institutionId, role: "member" };
    const members = await User.find(memberFilter).select("name email");

    let sent   = 0;
    const errors = [];

    for (const member of members) {
      if (!member.email) continue;
      try {
        await sendPlacementAlertEmail({
          to:          member.email,
          name:        member.name,
          companyName: drive.company?.name || "A Company",
          driveDate:   drive.driveDate
            ? new Date(drive.driveDate).toDateString()
            : "TBA",
        });

        await Notification.create({
          recipient:  member._id,
          institution: req.institutionId,
          type:        "new_drive",
          title:       `${drive.company?.name} is visiting campus!`,
          message:     `Drive: ${drive.title}. Date: ${drive.driveDate ? new Date(drive.driveDate).toDateString() : "TBA"}`,
          link:        `/drives/${drive._id}`,
        });

        sent++;
      } catch (e) {
        errors.push(member.email);
      }
    }

    return successResponse(res, 200, `Drive alert sent to ${sent} students`, {
      sent,
      failed:      errors.length,
      failedEmails: errors,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET DRIVE APPLICATIONS (officer view) ────────────────────────────────
// GET /api/drives/:id/applications
const getDriveApplications = async (req, res) => {
  try {
    const drive = await PlacementDrive.findOne(
      tenantFilter(req, { _id: req.params.id })
    );
    if (!drive) return errorResponse(res, 404, "Drive not found");

    const applications = await Application.find({
      institution: req.institutionId,
    })
      .populate("student", "name email avatar academicStatus")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Drive applications fetched", applications);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getDrives, getDrive, getEligibleDrives,
  createDrive, updateDrive, deleteDrive,
  sendDriveAlert, getDriveApplications,
};
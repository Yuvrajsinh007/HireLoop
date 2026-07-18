const Institution       = require("../models/Institution");
const InstitutionDomain = require("../models/InstitutionDomain");
const User              = require("../models/User");
const MemberProfile     = require("../models/MemberProfile");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── GET ALL INSTITUTIONS ──────────────────────────────────────────────────
// GET /api/super-admin/institutions
const getAllInstitutions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    if (status) filter.status = status;
    if (search) filter.$or = [
      { name:         { $regex: search, $options: "i" } },
      { contactEmail: { $regex: search, $options: "i" } },
    ];

    const [institutions, total] = await Promise.all([
      Institution.find(filter)
        .populate("primaryAdmin", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Institution.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Institutions fetched", {
      institutions,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET SINGLE INSTITUTION ────────────────────────────────────────────────
// GET /api/super-admin/institutions/:id
const getInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id)
      .populate("primaryAdmin", "name email");
    if (!institution) return errorResponse(res, 404, "Institution not found");

    const [domains, totalUsers, totalStudents] = await Promise.all([
      InstitutionDomain.find({ institution: req.params.id }),
      User.countDocuments({ institution: req.params.id }),
      User.countDocuments({ institution: req.params.id, role: "member" }),
    ]);

    return successResponse(res, 200, "Institution fetched", {
      institution,
      domains,
      stats: { totalUsers, totalStudents },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── REGISTER NEW INSTITUTION (public form submission) ─────────────────────
// POST /api/super-admin/institutions/register
const registerInstitution = async (req, res) => {
  try {
    const {
      name, shortName, type, website, description,
      address, contactEmail, contactPhone,
      primaryAdminName, primaryAdminEmail, primaryAdminPassword,
      domains,
    } = req.body;

    if (!name || !contactEmail || !primaryAdminEmail || !primaryAdminPassword)
      return errorResponse(res, 400, "Name, contact email, and primary admin details are required");

    // Check if institution with same name exists
    const exists = await Institution.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (exists) return errorResponse(res, 400, "An institution with this name already exists");

    // Check if admin email is taken
    const adminExists = await User.findOne({ email: primaryAdminEmail });
    if (adminExists) return errorResponse(res, 400, "Admin email already registered");

    // Create institution (pending approval)
    const institution = await Institution.create({
      name, shortName, type, website, description,
      address, contactEmail, contactPhone,
      status: "pending",
    });

    // Create primary admin user
    const adminUser = await User.create({
      name:            primaryAdminName || name + " Admin",
      email:           primaryAdminEmail,
      password:        primaryAdminPassword,
      role:            "collegeAdmin",
      institution:     institution._id,
      academicStatus:  "NOT_APPLICABLE",
      placementStatus: "NOT_APPLICABLE",
      employmentStatus:"NOT_APPLICABLE",
    });

    institution.primaryAdmin = adminUser._id;
    await institution.save();

    // Register domains if provided
    if (domains?.length) {
      const domainDocs = domains.map((d) => ({
        institution: institution._id,
        domain:      d.toLowerCase().trim(),
        allowedFor:  ["student","alumni"],
        addedBy:     adminUser._id,
      }));
      await InstitutionDomain.insertMany(domainDocs).catch(() => {});
    }

    return successResponse(res, 201, "Institution registration submitted. Awaiting platform approval.", {
      institution: {
        _id:    institution._id,
        name:   institution.name,
        status: institution.status,
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── APPROVE INSTITUTION ──────────────────────────────────────────────────
// PUT /api/super-admin/institutions/:id/approve
const approveInstitution = async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      {
        status:      "active",
        approvedBy:  req.user._id,
        approvedAt:  new Date(),
        rejectionReason: "",
      },
      { new: true }
    );
    if (!institution) return errorResponse(res, 404, "Institution not found");

    // Activate the primary admin account
    if (institution.primaryAdmin) {
      await User.findByIdAndUpdate(institution.primaryAdmin, { isActive: true });
    }

    return successResponse(res, 200, "Institution approved successfully", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── REJECT INSTITUTION ───────────────────────────────────────────────────
// PUT /api/super-admin/institutions/:id/reject
const rejectInstitution = async (req, res) => {
  try {
    const { reason } = req.body;
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      {
        status:          "rejected",
        rejectionReason: reason || "",
      },
      { new: true }
    );
    if (!institution) return errorResponse(res, 404, "Institution not found");
    return successResponse(res, 200, "Institution rejected", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── SUSPEND INSTITUTION ──────────────────────────────────────────────────
// PUT /api/super-admin/institutions/:id/suspend
const suspendInstitution = async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { status: "suspended" },
      { new: true }
    );
    if (!institution) return errorResponse(res, 404, "Institution not found");
    return successResponse(res, 200, "Institution suspended", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── REACTIVATE INSTITUTION ───────────────────────────────────────────────
// PUT /api/super-admin/institutions/:id/reactivate
const reactivateInstitution = async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );
    if (!institution) return errorResponse(res, 404, "Institution not found");
    return successResponse(res, 200, "Institution reactivated", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── PLATFORM STATS ───────────────────────────────────────────────────────
// GET /api/super-admin/stats
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalInstitutions,
      activeInstitutions,
      pendingInstitutions,
      totalUsers,
      totalStudents,
      totalAlumni,
      totalOfficers,
    ] = await Promise.all([
      Institution.countDocuments(),
      Institution.countDocuments({ status: "active" }),
      Institution.countDocuments({ status: "pending" }),
      User.countDocuments(),
      User.countDocuments({ role: "member", academicStatus: { $in: ["ENROLLED","FINAL_YEAR"] } }),
      User.countDocuments({ role: "member", academicStatus: "GRADUATED" }),
      User.countDocuments({ role: "officer" }),
    ]);

    return successResponse(res, 200, "Platform stats fetched", {
      totalInstitutions,
      activeInstitutions,
      pendingInstitutions,
      totalUsers,
      totalStudents,
      totalAlumni,
      totalOfficers,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET ALL USERS (platform-wide) ────────────────────────────────────────
// GET /api/super-admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, institution, page = 1, limit = 20, search } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    if (role)        filter.role        = role;
    if (institution) filter.institution = institution;
    if (search) filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("institution", "name shortName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Users fetched", {
      users, total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getAllInstitutions, getInstitution,
  registerInstitution,
  approveInstitution, rejectInstitution,
  suspendInstitution, reactivateInstitution,
  getPlatformStats, getAllUsers,
};
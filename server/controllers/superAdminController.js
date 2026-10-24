const crypto = require("crypto");
const mongoose = require("mongoose");
const Institution = require("../models/Institution");
const InstitutionRequest = require("../models/InstitutionRequest");
const InstitutionDomain = require("../models/InstitutionDomain");
const User = require("../models/User");

const { successResponse, errorResponse } = require("../utils/apiResponse");
const { sendStaffInviteEmail, sendWelcomeEmail, sendSuspensionEmail, sendReactivationEmail} = require("../utils/sendEmail");
const { writeAudit } = require("../utils/audit");

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL INSTITUTIONS & REQUESTS (Unified Filterable List)
// GET /api/super-admin/institutions
// ─────────────────────────────────────────────────────────────────────────────
const getAllInstitutions = async (req, res) => {
  try {
    const { status, page = 1, limit = 15, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const buildSearch = (fieldEmail = "contactEmail") => {
      if (!search) return {};
      return {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { [fieldEmail]: { $regex: search, $options: "i" } },
        ],
      };
    };

    let institutions = [];
    let total = 0;

    if (status === "pending" || status === "rejected") {
      const query = { status, ...buildSearch("contactEmail") };
      const [requests, reqTotal] = await Promise.all([
        InstitutionRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        InstitutionRequest.countDocuments(query),
      ]);

      institutions = requests.map((r) => ({
        ...r.toObject(),
        isRequest: true,
        primaryAdmin: {
          name: r.primaryAdminName,
          email: r.primaryAdminEmail,
        },
      }));
      total = reqTotal;
    } else if (status === "active" || status === "suspended") {
      const query = { status, ...buildSearch("contactEmail") };
      const [insts, instTotal] = await Promise.all([
        Institution.find(query)
          .populate("primaryAdmin", "name email isActive")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Institution.countDocuments(query),
      ]);

      institutions = insts.map((i) => ({
        ...i.toObject(),
        isRequest: false,
      }));
      total = instTotal;
    } else {
      // "all" status requested: fetch both collections
      const [requests, insts] = await Promise.all([
        InstitutionRequest.find(buildSearch("contactEmail")).sort({ createdAt: -1 }),
        Institution.find(buildSearch("contactEmail")).populate("primaryAdmin", "name email isActive").sort({ createdAt: -1 }),
      ]);

      const mappedRequests = requests.map((r) => ({
        ...r.toObject(),
        isRequest: true,
        primaryAdmin: {
          name: r.primaryAdminName,
          email: r.primaryAdminEmail,
        },
      }));

      const mappedInsts = insts.map((i) => ({
        ...i.toObject(),
        isRequest: false,
      }));

      const combined = [...mappedRequests, ...mappedInsts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      total = combined.length;
      institutions = combined.slice(skip, skip + limitNum);
    }

    return successResponse(res, 200, "Institutions fetched", {
      institutions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE INSTITUTION
// ─────────────────────────────────────────────────────────────────────────────
const getInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id).populate("primaryAdmin", "name email");
    if (!institution) {
      return errorResponse(res, 404, "Institution not found");
    }

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

// ─────────────────────────────────────────────────────────────────────────────
// CREATE INSTITUTION MANUALLY (SUPER ADMIN MODAL)
// ─────────────────────────────────────────────────────────────────────────────
const createInstitution = async (req, res) => {
  try {
    const { name, shortName, type, website, description, primaryAdminName, primaryAdminEmail } = req.body;

    if (!name || !primaryAdminEmail || !primaryAdminName) {
      return errorResponse(res, 400, "Institution name and primary admin details are required");
    }

    const exists = await Institution.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (exists) {
      return errorResponse(res, 400, "An institution with this name already exists");
    }

    const adminExists = await User.findOne({ email: primaryAdminEmail.toLowerCase().trim() });
    if (adminExists) {
      return errorResponse(res, 400, "Admin email already registered on the platform");
    }

    const institution = await Institution.create({
      name: name.trim(),
      shortName: shortName?.trim() || "",
      type: type || "Autonomous College",
      website: website?.trim() || "",
      description: description?.trim() || "",
      status: "active",
      isActive: true,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    const tempPassword = crypto.randomBytes(6).toString("hex");

    const adminUser = await User.create({
      name: primaryAdminName.trim(),
      email: primaryAdminEmail.toLowerCase().trim(),
      password: tempPassword,
      role: "collegeAdmin",
      institution: institution._id,
      academicStatus: "NOT_APPLICABLE",
      placementStatus: "NOT_APPLICABLE",
      employmentStatus: "NOT_APPLICABLE",
      isActive: true,
      isEmailVerified: true,
    });

    institution.primaryAdmin = adminUser._id;
    await institution.save();

    try {
      await sendStaffInviteEmail({
        to: primaryAdminEmail,
        name: primaryAdminName,
        role: "collegeAdmin",
        tempPassword,
      });
    } catch (emailErr) {
      console.error("Failed to send college admin invite email:", emailErr);
    }

    return successResponse(res, 201, "Institution created and admin invited successfully", {
      institution: {
        _id: institution._id,
        name: institution.name,
        status: institution.status,
      },
      temporaryPassword: tempPassword,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// APPROVE REQUEST
// PUT /api/super-admin/institutions/:id/approve
const approveInstitution = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await InstitutionRequest.findById(req.params.id).session(session);
    
    if (!request) {
      await session.abortTransaction();
      return errorResponse(res, 404, "Institution registration request not found");
    }

    if (request.status !== "pending") {
      await session.abortTransaction();
      return errorResponse(res, 400, `Cannot approve a request that is already ${request.status}`);
    }

    // 1. Create main Institution document
    const [institution] = await Institution.create([{
      name: request.name,
      shortName: request.shortName,
      type: request.type,
      website: request.website,
      description: request.description,
      logo: request.logo,
      registrationContactName: request.registrationContactName,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      address: request.address,
      emailDomains: request.emailDomains || [],
      status: "active",
      isActive: true,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    }], { session });

    // 2. Create the College Admin User
    const [adminUser] = await User.create([{
      name: request.primaryAdminName,
      email: request.primaryAdminEmail,
      password: request.password, 
      role: "collegeAdmin",
      institution: institution._id,
      academicStatus: "NOT_APPLICABLE",
      placementStatus: "NOT_APPLICABLE",
      employmentStatus: "NOT_APPLICABLE",
      isActive: true,
      isEmailVerified: true,
    }], { session });

    institution.primaryAdmin = adminUser._id;
    await institution.save({ session });

    // 3. Register email domains in InstitutionDomain collection
    if (Array.isArray(request.emailDomains) && request.emailDomains.length > 0) {
      for (let rawDom of request.emailDomains) {
        const cleanDom = rawDom.toLowerCase().trim().replace(/^@/, "").replace(/^https?:\/\//, "");
        if (!cleanDom) continue;

        const taken = await InstitutionDomain.findOne({ domain: cleanDom }).session(session);
        if (!taken) {
          await InstitutionDomain.create([{
            institution: institution._id,
            domain: cleanDom,
            allowedFor: ["student"],
            isActive: true, 
            addedBy: req.user._id,
          }], { session });
        }
      }
    }

    // 4. Remove completely from temporary InstitutionRequest model
    await InstitutionRequest.findByIdAndDelete(request._id).session(session);

    // Commit the database changes
    await session.commitTransaction();
    session.endSession();

    // 5. SEND THE APPROVAL EMAIL (Add this block here)
    try {
      await sendWelcomeEmail({
        to: request.primaryAdminEmail,
        name: request.primaryAdminName
      });
    } catch (emailErr) {
      console.error("Failed to send college approval welcome email:", emailErr.message);
    }

    // 6. Log the Audit Event
    await writeAudit(req, {
      action: "APPROVE_INSTITUTION",
      entity: "Institution",
      entityId: institution._id,
      meta: { name: institution.name, requestId: request._id },
    });

    return successResponse(res, 200, "Institution approved and activated.", institution);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REJECT REQUEST
// PUT /api/super-admin/institutions/:id/reject
// ─────────────────────────────────────────────────────────────────────────────
const rejectInstitution = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return errorResponse(res, 400, "Rejection reason is required");

    const request = await InstitutionRequest.findById(req.params.id);
    if (!request) return errorResponse(res, 404, "Institution request not found");

    request.status = "rejected";
    request.rejectionReason = reason.trim();
    await request.save();

    await writeAudit(req, {
      action: "REJECT_INSTITUTION_REQUEST",
      entity: "InstitutionRequest",
      entityId: request._id,
      meta: { name: request.name, reason },
    });

    return successResponse(res, 200, "Institution request marked as rejected", request);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUSPEND INSTITUTION
// ─────────────────────────────────────────────────────────────────────────────
const suspendInstitution = async (req, res) => {
  try {
    const { reason } = req.body;
    const suspensionReason = reason?.trim() || "Suspended by Super Admin due to policy violations.";

    // We populate the primaryAdmin so we have their name and email for the alert
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      {
        status: "suspended",
        suspensionReason: suspensionReason,
      },
      { new: true }
    ).populate("primaryAdmin", "name email");

    if (!institution) return errorResponse(res, 404, "Institution not found");

    // Send the suspension email alert to the primary admin
    if (institution.primaryAdmin && institution.primaryAdmin.email) {
      try {
        await sendSuspensionEmail({
          to: institution.primaryAdmin.email,
          name: institution.primaryAdmin.name,
          institutionName: institution.name,
          reason: suspensionReason,
        });
      } catch (emailErr) {
        console.error("Failed to send suspension email:", emailErr.message);
      }
    }

    // Log the audit event
    await writeAudit(req, {
      action: "SUSPEND_INSTITUTION",
      entity: "Institution",
      entityId: institution._id,
      meta: { name: institution.name, reason: suspensionReason },
    });

    return successResponse(res, 200, "Institution suspended successfully.", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REACTIVATE INSTITUTION
// ─────────────────────────────────────────────────────────────────────────────
const reactivateInstitution = async (req, res) => {
  try {
    // Populate primaryAdmin to get the email and name
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { 
        status: "active",
        suspensionReason: "" // Clear the suspension reason
      },
      { new: true }
    ).populate("primaryAdmin", "name email");

    if (!institution) return errorResponse(res, 404, "Institution not found");

    // Send the reactivation email alert to the primary admin
    if (institution.primaryAdmin && institution.primaryAdmin.email) {
      try {
        await sendReactivationEmail({
          to: institution.primaryAdmin.email,
          name: institution.primaryAdmin.name,
          institutionName: institution.name,
        });
      } catch (emailErr) {
        console.error("Failed to send reactivation email:", emailErr.message);
      }
    }

    // Log the audit event
    await writeAudit(req, {
      action: "REACTIVATE_INSTITUTION",
      entity: "Institution",
      entityId: institution._id,
      meta: { name: institution.name },
    });

    return successResponse(res, 200, "Institution reactivated successfully.", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM STATS
// ─────────────────────────────────────────────────────────────────────────────
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalInstitutions,
      activeInstitutions,
      pendingInstitutions,
      suspendedInstitutions,
      totalUsers,
      totalStudents,
      totalOfficers,
      totalCollegeAdmins,
    ] = await Promise.all([
      Institution.countDocuments(),
      Institution.countDocuments({ status: "active" }),
      InstitutionRequest.countDocuments({ status: "pending" }),
      Institution.countDocuments({ status: "suspended" }),
      User.countDocuments(),
      User.countDocuments({ role: "member" }),
      User.countDocuments({ role: "officer" }),
      User.countDocuments({ role: "collegeAdmin" }),
    ]);

    return successResponse(res, 200, "Platform stats fetched", {
      totalInstitutions,
      activeInstitutions,
      pendingInstitutions,
      suspendedInstitutions,
      totalUsers,
      totalStudents,
      totalOfficers,
      totalCollegeAdmins,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL USERS
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, institution, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const filter = {};

    if (role) filter.role = role;
    if (institution) filter.institution = institution;
    if (search) {
      filter.$or = [
        { name: { $regex: search,$options: "i" } },
        { email: { $regex: search,$options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("institution", "name shortName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Users fetched", {
      users,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getAllInstitutions,
  getInstitution,
  createInstitution,
  approveInstitution,
  rejectInstitution,
  suspendInstitution,
  reactivateInstitution,
  getPlatformStats,
  getAllUsers,
};
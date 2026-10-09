const crypto = require("crypto");

const Institution = require("../models/Institution");
const InstitutionDomain = require("../models/InstitutionDomain");
const User = require("../models/User");
const InstitutionRequest = require("../models/InstitutionRequest");

const {
  successResponse,
  errorResponse,
} = require("../utils/apiResponse");

const {
  sendStaffInviteEmail,
} = require("../utils/sendEmail");

const { writeAudit } = require("../utils/audit");

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: REGISTER INSTITUTION
// POST /api/super-admin/institutions/register
// ─────────────────────────────────────────────────────────────────────────────
const registerInstitution = async (req, res) => {
  try {
    const {
      name,
      shortName,
      type,
      website,
      description,
      contactName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      pincode,
      primaryAdminName,
      primaryAdminEmail,
      password,
      emailDomains,
      logo,
    } = req.body;

    // Validation
    if (!name?.trim()) {
      return errorResponse(
        res,
        400,
        "Institution name is required"
      );
    }

    if (!contactName?.trim()) {
      return errorResponse(
        res,
        400,
        "Contact person name is required"
      );
    }

    if (!contactEmail?.trim()) {
      return errorResponse(
        res,
        400,
        "Official email is required"
      );
    }

    const normalizedName = name.trim();
    const adminEmail = (primaryAdminEmail || contactEmail).trim().toLowerCase();
    const adminName = (primaryAdminName || contactName).trim();
    const normalizedEmail = adminEmail;

    // Check duplicate institution in active institutions
    const existingInstitution = await Institution.findOne({
      name: {
        $regex: `^${normalizedName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}$`,
        $options: "i",
      },
    });

    if (existingInstitution) {
      return errorResponse(
        res,
        400,
        "An institution with this name already exists"
      );
    }

    // Check duplicate in requests
    const existingRequest = await InstitutionRequest.findOne({
      name: {
        $regex: `^${normalizedName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}$`,
        $options: "i",
      },
    });

    if (existingRequest && existingRequest.status === "pending") {
      return errorResponse(
        res,
        400,
        "A registration request for this institution is already pending"
      );
    }

    // Check whether email belongs to an existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return errorResponse(
        res,
        400,
        "This email is already registered on the platform"
      );
    }

    if (!password || password.length < 6) {
      return errorResponse(
        res,
        400,
        "A password of at least 6 characters is required for the primary admin"
      );
    }

    const domains = Array.isArray(emailDomains)
      ? emailDomains
      : typeof emailDomains === "string" && emailDomains.trim()
        ? emailDomains.split(",").map((d) => d.trim().toLowerCase().replace(/^@/, ""))
        : [];

    const request = await InstitutionRequest.create({
      name: normalizedName,
      shortName: shortName?.trim() || "",
      type: type || "Autonomous College",
      website: website?.trim() || "",
      description: description?.trim() || "",
      logo: logo || "",
      registrationContactName: adminName,
      contactEmail: normalizedEmail,
      contactPhone: contactPhone?.trim() || "",
      address: {
        street: address?.trim?.() || address?.street || "",
        city: city || address?.city || "",
        state: state || address?.state || "",
        pincode: pincode || address?.pincode || "",
      },
      primaryAdminName: adminName,
      primaryAdminEmail: normalizedEmail,
      password: password, // Will be hashed upon approval
      emailDomains: domains,
      status: "pending",
    });

    return successResponse(
      res,
      201,
      "Institution registration submitted successfully",
      {
        institution: {
          _id: request._id,
          name: request.name,
          status: request.status,
          contactEmail: request.contactEmail,
        },
      }
    );
  } catch (err) {
    console.error(
      "registerInstitution error:",
      err
    );

    return errorResponse(
      res,
      500,
      err.message
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL INSTITUTIONS
// ─────────────────────────────────────────────────────────────────────────────
const getAllInstitutions = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const skip =
      (parseInt(page) - 1) *
      parseInt(limit);

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          contactEmail: {
            $regex: search,
            $options: "i",
          },
        },
        {
          registrationContactName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    let institutions = [];
    let total = 0;
    
    if (status === "pending" || status === "rejected") {
      const [requests, reqTotal] = await Promise.all([
        InstitutionRequest.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        InstitutionRequest.countDocuments(filter),
      ]);
      institutions = requests.map(req => ({
        ...req.toObject(),
        isRequest: true,
        studentCount: 0,
        officerCount: 0,
      }));
      total = reqTotal;
    } else if (status === "active" || status === "suspended") {
      const [insts, instTotal] = await Promise.all([
        Institution.find(filter)
          .populate("primaryAdmin", "name email isActive")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Institution.countDocuments(filter),
      ]);
      
      const ids = insts.map((i) => i._id);
      const [studentCounts, officerCounts] = await Promise.all([
        User.aggregate([
          { $match: { institution: { $in: ids }, role: "member" } },
          { $group: { _id: "$institution", count: { $sum: 1 } } },
        ]),
        User.aggregate([
          { $match: { institution: { $in: ids }, role: "officer" } },
          { $group: { _id: "$institution", count: { $sum: 1 } } },
        ]),
      ]);
      const studentMap = Object.fromEntries(studentCounts.map((s) => [s._id.toString(), s.count]));
      const officerMap = Object.fromEntries(officerCounts.map((s) => [s._id.toString(), s.count]));
      institutions = insts.map((inst) => ({
        ...inst.toObject(),
        isRequest: false,
        studentCount: studentMap[inst._id.toString()] || 0,
        officerCount: officerMap[inst._id.toString()] || 0,
      }));
      total = instTotal;
    } else {
      // If no status provided, we fetch both but prioritize pending at the top
      // This is a simplified merge since full combined pagination is complex
      const [requests, insts] = await Promise.all([
        InstitutionRequest.find(filter).sort({ createdAt: -1 }).limit(10),
        Institution.find(filter).populate("primaryAdmin", "name email isActive").sort({ createdAt: -1 }).limit(10)
      ]);
      
      const mappedRequests = requests.map(req => ({ ...req.toObject(), isRequest: true, studentCount: 0, officerCount: 0 }));
      const ids = insts.map((i) => i._id);
      const [studentCounts, officerCounts] = await Promise.all([
        User.aggregate([
          { $match: { institution: { $in: ids }, role: "member" } },
          { $group: { _id: "$institution", count: { $sum: 1 } } },
        ]),
        User.aggregate([
          { $match: { institution: { $in: ids }, role: "officer" } },
          { $group: { _id: "$institution", count: { $sum: 1 } } },
        ]),
      ]);
      const studentMap = Object.fromEntries(studentCounts.map((s) => [s._id.toString(), s.count]));
      const officerMap = Object.fromEntries(officerCounts.map((s) => [s._id.toString(), s.count]));
      const mappedInsts = insts.map((inst) => ({
        ...inst.toObject(),
        isRequest: false,
        studentCount: studentMap[inst._id.toString()] || 0,
        officerCount: officerMap[inst._id.toString()] || 0,
      }));
      
      institutions = [...mappedRequests, ...mappedInsts];
      total = await InstitutionRequest.countDocuments(filter) + await Institution.countDocuments(filter);
    }

    return successResponse(
      res,
      200,
      "Institutions fetched",
      {
        institutions,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(
          total / parseInt(limit)
        ),
      }
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      err.message
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE INSTITUTION
// ─────────────────────────────────────────────────────────────────────────────
const getInstitution = async (req, res) => {
  try {
    const institution =
      await Institution.findById(req.params.id)
        .populate(
          "primaryAdmin",
          "name email"
        );

    if (!institution) {
      return errorResponse(
        res,
        404,
        "Institution not found"
      );
    }

    const [
      domains,
      totalUsers,
      totalStudents,
    ] = await Promise.all([
      InstitutionDomain.find({
        institution: req.params.id,
      }),

      User.countDocuments({
        institution: req.params.id,
      }),

      User.countDocuments({
        institution: req.params.id,
        role: "member",
      }),
    ]);

    return successResponse(
      res,
      200,
      "Institution fetched",
      {
        institution,
        domains,
        stats: {
          totalUsers,
          totalStudents,
        },
      }
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      err.message
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE INSTITUTION BY SUPER ADMIN
// POST /api/super-admin/institutions
// ─────────────────────────────────────────────────────────────────────────────
const createInstitution = async (req, res) => {
  try {
    const {
      name,
      shortName,
      type,
      website,
      description,
      primaryAdminName,
      primaryAdminEmail,
    } = req.body;

    if (
      !name ||
      !primaryAdminEmail ||
      !primaryAdminName
    ) {
      return errorResponse(
        res,
        400,
        "Institution name and primary admin details are required"
      );
    }

    const exists =
      await Institution.findOne({
        name: {
          $regex: `^${name}$`,
          $options: "i",
        },
      });

    if (exists) {
      return errorResponse(
        res,
        400,
        "An institution with this name already exists"
      );
    }

    const adminExists =
      await User.findOne({
        email: primaryAdminEmail,
      });

    if (adminExists) {
      return errorResponse(
        res,
        400,
        "Admin email already registered on the platform"
      );
    }

    const institution =
      await Institution.create({
        name,
        shortName,
        type,
        website,
        description,
        status: "active",
        approvedBy: req.user._id,
        approvedAt: new Date(),
      });

    const tempPassword =
      crypto.randomBytes(6).toString("hex");

    const adminUser =
      await User.create({
        name: primaryAdminName,
        email: primaryAdminEmail,
        password: tempPassword,
        role: "collegeAdmin",
        institution: institution._id,
        academicStatus: "NOT_APPLICABLE",
        placementStatus: "NOT_APPLICABLE",
        employmentStatus: "NOT_APPLICABLE",
        isActive: true,
        isEmailVerified: true,
      });

    institution.primaryAdmin =
      adminUser._id;

    await institution.save();

    try {
      await sendStaffInviteEmail({
        to: primaryAdminEmail,
        name: primaryAdminName,
        role: "collegeAdmin",
        tempPassword,
      });
    } catch (emailErr) {
      console.error(
        "Failed to send college admin invite:",
        emailErr
      );
    }

    return successResponse(
      res,
      201,
      "Institution created and admin invited successfully",
      {
        institution: {
          _id: institution._id,
          name: institution.name,
          status: institution.status,
        },
        temporaryPassword: tempPassword,
      }
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      err.message
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUSPEND
// ─────────────────────────────────────────────────────────────────────────────
const approveInstitution = async (req, res) => {
  try {
    const request = await InstitutionRequest.findById(req.params.id);
    if (!request) return errorResponse(res, 404, "Institution request not found");

    if (request.status !== "pending") {
      return errorResponse(res, 400, "Institution is not pending");
    }

    // 1. Create Institution
    const institution = await Institution.create({
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
      status: "active",
      isActive: true,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    // 2. Create User (Admin)
    const adminUser = await User.create({
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
    });

    institution.primaryAdmin = adminUser._id;
    await institution.save();

    // 3. Create Domains
    for (const domain of request.emailDomains) {
      const taken = await InstitutionDomain.findOne({ domain });
      if (!taken) {
        await InstitutionDomain.create({
          institution: institution._id,
          domain,
          allowedFor: ["student"],
          isActive: true,
        });
      }
    }

    // 4. Delete Request
    await InstitutionRequest.findByIdAndDelete(request._id);

    await writeAudit(req, {
      action: "APPROVE_INSTITUTION",
      entity: "Institution",
      entityId: institution._id,
      meta: { name: institution.name }
    });

    return successResponse(res, 200, "Institution approved", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const rejectInstitution = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return errorResponse(res, 400, "Rejection reason is required");

    const request = await InstitutionRequest.findById(req.params.id);
    if (!request) return errorResponse(res, 404, "Institution request not found");

    request.status = "rejected";
    request.rejectionReason = reason.trim();
    await request.save();

    return successResponse(res, 200, "Institution rejected", request);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const suspendInstitution = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return errorResponse(res, 400, "Suspension reason is required");
    }

    const institution =
      await Institution.findByIdAndUpdate(
        req.params.id,
        {
          status: "suspended",
          suspensionReason: reason.trim(),
        },
        {
          new: true,
        }
      );

    if (!institution) {
      return errorResponse(
        res,
        404,
        "Institution not found"
      );
    }

    return successResponse(
      res,
      200,
      "Institution suspended",
      institution
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      err.message
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REACTIVATE
// ─────────────────────────────────────────────────────────────────────────────
const reactivateInstitution = async (req, res) => {
  try {
    const institution =
      await Institution.findByIdAndUpdate(
        req.params.id,
        {
          status: "active",
        },
        {
          new: true,
        }
      );

    if (!institution) {
      return errorResponse(
        res,
        404,
        "Institution not found"
      );
    }

    return successResponse(
      res,
      200,
      "Institution reactivated",
      institution
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      err.message
    );
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
      Institution.countDocuments({ status: "pending" }),
      Institution.countDocuments({ status: "suspended" }),
      User.countDocuments(),
      User.countDocuments({ role: "member" }),
      User.countDocuments({ role: "officer" }),
      User.countDocuments({ role: "collegeAdmin" }),
    ]);

    return successResponse(
      res,
      200,
      "Platform stats fetched",
      {
        totalInstitutions,
        activeInstitutions,
        pendingInstitutions,
        suspendedInstitutions,
        totalUsers,
        totalStudents,
        totalOfficers,
        totalCollegeAdmins,
      }
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      err.message
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL USERS
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      institution,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const skip =
      (parseInt(page) - 1) *
      parseInt(limit);

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (institution) {
      filter.institution = institution;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [
      users,
      total,
    ] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate(
          "institution",
          "name shortName"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      User.countDocuments(filter),
    ]);

    return successResponse(
      res,
      200,
      "Users fetched",
      {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(
          total / parseInt(limit)
        ),
      }
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      err.message
    );
  }
};

module.exports = {
  registerInstitution,
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
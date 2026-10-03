const crypto = require("crypto");

const Institution = require("../models/Institution");
const InstitutionDomain = require("../models/InstitutionDomain");
const User = require("../models/User");

const {
  successResponse,
  errorResponse,
} = require("../utils/apiResponse");

const {
  sendStaffInviteEmail,
} = require("../utils/sendEmail");

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: REGISTER INSTITUTION
// POST /api/super-admin/institutions/register
// ─────────────────────────────────────────────────────────────────────────────
const registerInstitution = async (req, res) => {
  try {
    const {
      name,
      contactName,
      contactEmail,
      contactPhone,
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
    const normalizedEmail = contactEmail.trim().toLowerCase();

    // Check duplicate institution
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
      if (existingInstitution.status === "pending") {
        return errorResponse(
          res,
          400,
          "A registration request for this institution is already pending"
        );
      }

      return errorResponse(
        res,
        400,
        "An institution with this name already exists"
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

    // Create pending institution
    const institution = await Institution.create({
      name: normalizedName,

      registrationContactName: contactName.trim(),

      contactEmail: normalizedEmail,

      contactPhone: contactPhone?.trim() || "",

      status: "pending",

      isActive: true,
    });

    return successResponse(
      res,
      201,
      "Institution registration submitted successfully",
      {
        institution: {
          _id: institution._id,
          name: institution.name,
          status: institution.status,
          contactEmail: institution.contactEmail,
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

    const [
      institutions,
      total,
    ] = await Promise.all([
      Institution.find(filter)
        .populate(
          "primaryAdmin",
          "name email"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      Institution.countDocuments(filter),
    ]);

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
const suspendInstitution = async (req, res) => {
  try {
    const institution =
      await Institution.findByIdAndUpdate(
        req.params.id,
        {
          status: "suspended",
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
      totalUsers,
      totalStudents,
      totalOfficers,
    ] = await Promise.all([
      Institution.countDocuments(),

      Institution.countDocuments({
        status: "active",
      }),

      User.countDocuments(),

      User.countDocuments({
        role: "member",
        academicStatus: {
          $in: [
            "ENROLLED",
            "FINAL_YEAR",
          ],
        },
      }),

      User.countDocuments({
        role: "member",
        academicStatus: "GRADUATED",
      }),

      User.countDocuments({
        role: "officer",
      }),
    ]);

    return successResponse(
      res,
      200,
      "Platform stats fetched",
      {
        totalInstitutions,
        activeInstitutions,
        totalUsers,
        totalStudents,
        totalOfficers,
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
  suspendInstitution,
  reactivateInstitution,
  getPlatformStats,
  getAllUsers,
};
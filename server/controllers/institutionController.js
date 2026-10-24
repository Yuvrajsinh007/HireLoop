const bcrypt = require("bcryptjs");
const Institution = require("../models/Institution");
const InstitutionRequest = require("../models/InstitutionRequest");
const InstitutionDomain = require("../models/InstitutionDomain");
const AcademicUnit = require("../models/AcademicUnit");
const Program = require("../models/Program");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── PUBLIC: REGISTER INSTITUTION REQUEST ────────────────────────────────────
const registerInstitution = async (req, res) => {
  try {
    const {
      name,
      shortName,
      type,
      website,
      description,
      logo,
      registrationContactName,
      contactPerson, // fallback compatibility
      contactEmail,
      email,         // fallback compatibility
      contactPhone,
      address,
      city,
      state,
      pincode,
      primaryAdminName,
      primaryAdminEmail,
      adminDetails,  // fallback compatibility
      password,
      emailDomains,
      domains,       // fallback compatibility
    } = req.body;

    const instName = name?.trim();
    const cName = (registrationContactName || contactPerson?.name || primaryAdminName || "").trim();
    const cEmail = (contactEmail || email || primaryAdminEmail || adminDetails?.email || "").toLowerCase().trim();
    const admName = (primaryAdminName || (adminDetails ? `${adminDetails.firstName} ${adminDetails.lastName}` : "") || cName).trim();
    const admEmail = (primaryAdminEmail || adminDetails?.email || cEmail).toLowerCase().trim();
    const rawPass = password || adminDetails?.password;

    if (!instName || !cName || !cEmail || !admEmail || !rawPass) {
      return errorResponse(res, 400, "Institution name, contact details, admin email, and password are required.");
    }

    // Check duplicate in active institutions
    const existingInst = await Institution.findOne({
      $or: [
        { name: { $regex: `^${instName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
        { contactEmail: cEmail },
      ],
    });

    if (existingInst) {
      return errorResponse(res, 400, "An institution with this name or email already exists.");
    }

    // Check duplicate in pending requests
    const existingReq = await InstitutionRequest.findOne({
      $or: [
        { name: { $regex: `^${instName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
        { contactEmail: cEmail },
      ],
      status: "pending",
    });

    if (existingReq) {
      return errorResponse(res, 400, "A registration request for this institution is already pending approval.");
    }

    // Check if user account already exists
    const existingUser = await User.findOne({ email: admEmail });
    if (existingUser) {
      return errorResponse(res, 400, "The administrator email is already registered on the platform.");
    }

    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const parsedDomains = Array.isArray(emailDomains || domains)
      ? (emailDomains || domains).map((d) => d.trim().toLowerCase().replace(/^@/, ""))
      : typeof emailDomains === "string" && emailDomains.trim()
      ? emailDomains.split(",").map((d) => d.trim().toLowerCase().replace(/^@/, ""))
      : [];

    const newRequest = await InstitutionRequest.create({
      name: instName,
      shortName: shortName?.trim() || "",
      type: type || "Autonomous College",
      website: website?.trim() || "",
      description: description?.trim() || "",
      logo: logo || "",
      registrationContactName: cName,
      contactEmail: cEmail,
      contactPhone: contactPhone || contactPerson?.phone || "",
      address: {
        street: address?.street || (typeof address === "string" ? address : ""),
        city: city || address?.city || "",
        state: state || address?.state || "",
        pincode: pincode || address?.pincode || "",
      },
      primaryAdminName: admName,
      primaryAdminEmail: admEmail,
      password: hashedPassword,
      emailDomains: parsedDomains,
      status: "pending",
    });

    return successResponse(res, 201, "Registration request submitted. Awaiting Super Admin review.", {
      requestId: newRequest._id,
      name: newRequest.name,
      status: newRequest.status,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── PUBLIC: LOOKUP DOMAIN ────────────────────────────────────────────────
// GET /api/institutions/lookup-domain?email=foo@bar.edu.in
const lookupDomain = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || !email.includes("@")) {
      return errorResponse(res, 400, "A valid email is required");
    }

    const rawDomain = email.split("@")[1]?.toLowerCase().trim();
    if (!rawDomain) return errorResponse(res, 400, "Invalid email domain");

    const cleanDomain = rawDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    // 1. Search in InstitutionDomain collection (UPDATED REGEX TO HANDLE COMMAS)
    let domainRecord = await InstitutionDomain.findOne({
      $or: [
        { domain: cleanDomain },
        // \b ensures it matches the exact domain word inside the comma-separated string
        { domain: new RegExp(`\\b${cleanDomain}\\b`, "i") }, 
        // Matches the root domain (e.g., "charusat.edu.in" even if email is "student@it.charusat.edu.in")
        { domain: new RegExp(`\\b${cleanDomain.split('.').slice(-2).join('.')}\\b`, "i") } 
      ]
    }).populate("institution", "name shortName logo status academicUnitLabel programLabel emailDomains");

    let matchedInstitution = null;
    let allowedRoles = ["student"];

    if (domainRecord && domainRecord.institution) {
      if (domainRecord.institution.status === "active") {
        matchedInstitution = domainRecord.institution;
        allowedRoles = domainRecord.allowedFor || ["student"];
      }
    }

    // 2. Fallback: Search directly in Institution collection
    if (!matchedInstitution) {
      const rootDomain = cleanDomain.split(".").slice(-2).join(".");

      const directInst = await Institution.findOne({
        status: "active",
        $or: [
          { emailDomains: new RegExp(`\\b${cleanDomain}\\b`, "i") },
          { emailDomains: new RegExp(`\\b${rootDomain}\\b`, "i") },
          { website: new RegExp(`\\b${cleanDomain}\\b`, "i") },
          { contactEmail: new RegExp(`@${cleanDomain}$`, "i") },
          { contactEmail: new RegExp(`@${rootDomain}$`, "i") }
        ]
      }).select("name shortName logo status academicUnitLabel programLabel emailDomains");

      if (directInst) {
        matchedInstitution = directInst;
      }
    }

    if (!matchedInstitution) {
      return successResponse(res, 200, "Domain not found", { found: false });
    }

    return successResponse(res, 200, "Institution found", {
      found: true,
      institution: {
        _id: matchedInstitution._id,
        name: matchedInstitution.name,
        shortName: matchedInstitution.shortName,
        logo: matchedInstitution.logo,
        status: matchedInstitution.status,
        domain: cleanDomain,
      },
      allowedFor: allowedRoles,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET MY INSTITUTION INFO ──────────────────────────────────────────────
const getMyInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.institutionId).populate("primaryAdmin", "name email");
    if (!institution) return errorResponse(res, 404, "Institution not found");
    return successResponse(res, 200, "Institution fetched", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE MY INSTITUTION ────────────────────────────────────────────────
const updateMyInstitution = async (req, res) => {
  try {
    const {
      name,
      shortName,
      type,
      website,
      description,
      address,
      contactEmail,
      contactPhone,
      academicUnitLabel,
      programLabel,
      settings,
    } = req.body;

    const institution = await Institution.findByIdAndUpdate(
      req.institutionId,
      {
        name,
        shortName,
        type,
        website,
        description,
        address,
        contactEmail,
        contactPhone,
        academicUnitLabel,
        programLabel,
        settings,
      },
      { new: true, runValidators: true }
    );

    if (!institution) return errorResponse(res, 404, "Institution not found");
    return successResponse(res, 200, "Institution updated", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DOMAINS ──────────────────────────────────────────────────────────────
const getDomains = async (req, res) => {
  try {
    const domains = await InstitutionDomain.find({ institution: req.institutionId });
    return successResponse(res, 200, "Domains fetched", domains);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const addDomain = async (req, res) => {
  try {
    const { domain, allowedFor } = req.body;
    if (!domain) return errorResponse(res, 400, "Domain is required");

    const exists = await InstitutionDomain.findOne({ domain: domain.toLowerCase().trim() });
    if (exists) return errorResponse(res, 400, "This domain is already registered on the platform");

    const domainRecord = await InstitutionDomain.create({
      institution: req.institutionId,
      domain: domain.toLowerCase().trim(),
      allowedFor: allowedFor || ["student"],
      addedBy: req.user._id,
    });

    return successResponse(res, 201, "Domain added", domainRecord);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const removeDomain = async (req, res) => {
  try {
    const domain = await InstitutionDomain.findOneAndDelete({
      _id: req.params.id,
      institution: req.institutionId,
    });
    if (!domain) return errorResponse(res, 404, "Domain not found");
    return successResponse(res, 200, "Domain removed");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ACADEMIC UNITS ───────────────────────────────────────────────────────
const getAcademicUnits = async (req, res) => {
  try {
    const units = await AcademicUnit.find({ institution: req.institutionId, isActive: true }).sort({ name: 1 });
    return successResponse(res, 200, "Academic units fetched", units);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const createAcademicUnit = async (req, res) => {
  try {
    const { name, code, description, head } = req.body;
    if (!name) return errorResponse(res, 400, "Name is required");

    const unit = await AcademicUnit.create({
      institution: req.institutionId,
      name,
      code,
      description,
      head,
    });
    return successResponse(res, 201, "Academic unit created", unit);
  } catch (err) {
    if (err.code === 11000) return errorResponse(res, 400, "An academic unit with this name already exists");
    return errorResponse(res, 500, err.message);
  }
};

const updateAcademicUnit = async (req, res) => {
  try {
    const unit = await AcademicUnit.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!unit) return errorResponse(res, 404, "Academic unit not found");
    return successResponse(res, 200, "Academic unit updated", unit);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const deleteAcademicUnit = async (req, res) => {
  try {
    const unit = await AcademicUnit.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId },
      { isActive: false },
      { new: true }
    );
    if (!unit) return errorResponse(res, 404, "Academic unit not found");
    return successResponse(res, 200, "Academic unit deactivated");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── PROGRAMS ─────────────────────────────────────────────────────────────
const getPrograms = async (req, res) => {
  try {
    const { academicUnit } = req.query;
    const filter = { institution: req.institutionId, isActive: true };
    if (academicUnit) filter.academicUnit = academicUnit;

    const programs = await Program.find(filter).populate("academicUnit", "name code").sort({ name: 1 });
    return successResponse(res, 200, "Programs fetched", programs);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const createProgram = async (req, res) => {
  try {
    const { academicUnit, name, code, degreeType, durationYears, description } = req.body;
    if (!academicUnit || !name) return errorResponse(res, 400, "Academic unit and name are required");

    const program = await Program.create({
      institution: req.institutionId,
      academicUnit,
      name,
      code,
      degreeType,
      durationYears,
      description,
    });

    await program.populate("academicUnit", "name code");
    return successResponse(res, 201, "Program created", program);
  } catch (err) {
    if (err.code === 11000) return errorResponse(res, 400, "A program with this name already exists in this unit");
    return errorResponse(res, 500, err.message);
  }
};

const updateProgram = async (req, res) => {
  try {
    const program = await Program.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!program) return errorResponse(res, 404, "Program not found");
    return successResponse(res, 200, "Program updated", program);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId },
      { isActive: false },
      { new: true }
    );
    if (!program) return errorResponse(res, 404, "Program not found");
    return successResponse(res, 200, "Program deactivated");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  registerInstitution,
  lookupDomain,
  getMyInstitution,
  updateMyInstitution,
  getDomains,
  addDomain,
  removeDomain,
  getAcademicUnits,
  createAcademicUnit,
  updateAcademicUnit,
  deleteAcademicUnit,
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
};
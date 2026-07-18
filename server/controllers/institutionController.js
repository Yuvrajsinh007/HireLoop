const Institution       = require("../models/Institution");
const InstitutionDomain = require("../models/InstitutionDomain");
const AcademicUnit      = require("../models/AcademicUnit");
const Program           = require("../models/Program");
const User              = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter, verifyTenantOwnership } = require("../middleware/tenantMiddleware");

// ─── PUBLIC: LOOKUP DOMAIN ────────────────────────────────────────────────
// GET /api/institutions/lookup-domain?email=foo@bar.edu.in
// Used during registration to detect which college the email belongs to
const lookupDomain = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return errorResponse(res, 400, "Email is required");

    const domain = email.split("@")[1]?.toLowerCase().trim();
    if (!domain) return errorResponse(res, 400, "Invalid email");

    const domainRecord = await InstitutionDomain.findOne({ domain })
      .populate("institution", "name shortName logo status academicUnitLabel programLabel");

    if (!domainRecord || !domainRecord.institution) {
      return successResponse(res, 200, "Domain not found", { found: false });
    }

    if (domainRecord.institution.status !== "active") {
      return successResponse(res, 200, "Institution not active", { found: false });
    }

    return successResponse(res, 200, "Institution found", {
      found:       true,
      institution: domainRecord.institution,
      allowedFor:  domainRecord.allowedFor,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET MY INSTITUTION INFO (college admin / officer / member) ───────────
// GET /api/institutions/me
const getMyInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.institutionId)
      .populate("primaryAdmin", "name email");
    if (!institution) return errorResponse(res, 404, "Institution not found");
    return successResponse(res, 200, "Institution fetched", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE MY INSTITUTION (college admin only) ───────────────────────────
// PUT /api/institutions/me
const updateMyInstitution = async (req, res) => {
  try {
    const {
      name, shortName, type, website, description,
      address, contactEmail, contactPhone,
      academicUnitLabel, programLabel, settings,
    } = req.body;

    const institution = await Institution.findByIdAndUpdate(
      req.institutionId,
      { name, shortName, type, website, description, address, contactEmail, contactPhone, academicUnitLabel, programLabel, settings },
      { new: true, runValidators: true }
    );

    if (!institution) return errorResponse(res, 404, "Institution not found");
    return successResponse(res, 200, "Institution updated", institution);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DOMAINS ──────────────────────────────────────────────────────────────
// GET /api/institutions/domains
const getDomains = async (req, res) => {
  try {
    const domains = await InstitutionDomain.find({ institution: req.institutionId });
    return successResponse(res, 200, "Domains fetched", domains);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/institutions/domains
const addDomain = async (req, res) => {
  try {
    const { domain, allowedFor } = req.body;
    if (!domain) return errorResponse(res, 400, "Domain is required");

    const exists = await InstitutionDomain.findOne({ domain: domain.toLowerCase().trim() });
    if (exists) return errorResponse(res, 400, "This domain is already registered on the platform");

    const domainRecord = await InstitutionDomain.create({
      institution: req.institutionId,
      domain:      domain.toLowerCase().trim(),
      allowedFor:  allowedFor || ["student"],
      addedBy:     req.user._id,
    });

    return successResponse(res, 201, "Domain added", domainRecord);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// DELETE /api/institutions/domains/:id
const removeDomain = async (req, res) => {
  try {
    const domain = await InstitutionDomain.findOneAndDelete({
      _id:         req.params.id,
      institution: req.institutionId,
    });
    if (!domain) return errorResponse(res, 404, "Domain not found");
    return successResponse(res, 200, "Domain removed");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ACADEMIC UNITS ───────────────────────────────────────────────────────
// GET /api/institutions/academic-units
const getAcademicUnits = async (req, res) => {
  try {
    const units = await AcademicUnit.find({ institution: req.institutionId, isActive: true })
      .sort({ name: 1 });
    return successResponse(res, 200, "Academic units fetched", units);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/institutions/academic-units
const createAcademicUnit = async (req, res) => {
  try {
    const { name, code, description, head } = req.body;
    if (!name) return errorResponse(res, 400, "Name is required");

    const unit = await AcademicUnit.create({
      institution: req.institutionId,
      name, code, description, head,
    });
    return successResponse(res, 201, "Academic unit created", unit);
  } catch (err) {
    if (err.code === 11000) return errorResponse(res, 400, "An academic unit with this name already exists");
    return errorResponse(res, 500, err.message);
  }
};

// PUT /api/institutions/academic-units/:id
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

// DELETE /api/institutions/academic-units/:id
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
// GET /api/institutions/programs
const getPrograms = async (req, res) => {
  try {
    const { academicUnit } = req.query;
    const filter = { institution: req.institutionId, isActive: true };
    if (academicUnit) filter.academicUnit = academicUnit;

    const programs = await Program.find(filter)
      .populate("academicUnit", "name code")
      .sort({ name: 1 });

    return successResponse(res, 200, "Programs fetched", programs);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/institutions/programs
const createProgram = async (req, res) => {
  try {
    const { academicUnit, name, code, degreeType, durationYears, description } = req.body;
    if (!academicUnit || !name) return errorResponse(res, 400, "Academic unit and name are required");

    const program = await Program.create({
      institution: req.institutionId,
      academicUnit, name, code, degreeType, durationYears, description,
    });

    await program.populate("academicUnit", "name code");
    return successResponse(res, 201, "Program created", program);
  } catch (err) {
    if (err.code === 11000) return errorResponse(res, 400, "A program with this name already exists in this unit");
    return errorResponse(res, 500, err.message);
  }
};

// PUT /api/institutions/programs/:id
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

// DELETE /api/institutions/programs/:id
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
  lookupDomain,
  getMyInstitution, updateMyInstitution,
  getDomains, addDomain, removeDomain,
  getAcademicUnits, createAcademicUnit, updateAcademicUnit, deleteAcademicUnit,
  getPrograms, createProgram, updateProgram, deleteProgram,
};
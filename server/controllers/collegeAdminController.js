const User = require("../models/User");
const InstitutionDomain = require("../models/InstitutionDomain");
const bcrypt = require("bcryptjs");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const crypto = require("crypto");
const { tenantFilter } = require("../middleware/tenantMiddleware");

// ─── OFFICERS ─────────────────────────────────────────────────────────────

// POST /api/college-admin/officers
const createOfficer = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return errorResponse(res, 400, "Name and email are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return errorResponse(res, 400, "Email already exists");

    const tempPassword = crypto.randomBytes(6).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    
    const officer = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "officer",
      institution: req.institutionId,
      isEmailVerified: true
    });
    
    // Convert to object and remove password
    const officerObj = officer.toObject();
    delete officerObj.password;

    return successResponse(res, 201, "Officer created", { officer: officerObj, tempPassword });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// PUT /api/college-admin/officers/:id
const updateOfficer = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (isActive !== undefined) updates.isActive = isActive;

    const officer = await User.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId, role: "officer" },
      updates,
      { new: true }
    ).select("-password");
    
    if (!officer) return errorResponse(res, 404, "Officer not found");
    return successResponse(res, 200, "Officer updated", officer);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// DELETE /api/college-admin/officers/:id/deactivate
const deactivateOfficer = async (req, res) => {
  try {
    const officer = await User.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId, role: "officer" },
      { isActive: false },
      { new: true }
    ).select("-password");
    
    if (!officer) return errorResponse(res, 404, "Officer not found");
    return successResponse(res, 200, "Officer deactivated", officer);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DOMAINS ──────────────────────────────────────────────────────────────

// GET /api/college-admin/domains
const getDomains = async (req, res) => {
  try {
    const domains = await InstitutionDomain.find({ institution: req.institutionId })
      .populate("addedBy", "name email");
    return successResponse(res, 200, "Domains fetched", domains);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/college-admin/domains
const addDomain = async (req, res) => {
  try {
    const { domain, allowedFor, isPrimary } = req.body;
    if (!domain) return errorResponse(res, 400, "Domain is required");
    
    const cleanDomain = domain.trim().toLowerCase();
    
    const existing = await InstitutionDomain.findOne({ domain: cleanDomain });
    if (existing) {
      if (existing.institution.toString() === req.institutionId.toString()) {
        return errorResponse(res, 400, "Domain already added to your institution");
      }
      return errorResponse(res, 400, "Domain already registered to another institution");
    }
    
    const newDomain = await InstitutionDomain.create({
      institution: req.institutionId,
      domain: cleanDomain,
      allowedFor: allowedFor || ["student"],
      isPrimary: isPrimary || false,
      isVerified: true, // Auto verify for simplicity or wait for txt record
      addedBy: req.user._id
    });
    
    return successResponse(res, 201, "Domain added", newDomain);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// PUT /api/college-admin/domains/:id/verify
const verifyDomain = async (req, res) => {
  try {
    const domainObj = await InstitutionDomain.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId },
      { isVerified: true },
      { new: true }
    );
    if (!domainObj) return errorResponse(res, 404, "Domain not found");
    return successResponse(res, 200, "Domain verified", domainObj);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// DELETE /api/college-admin/domains/:id
const removeDomain = async (req, res) => {
  try {
    const domainObj = await InstitutionDomain.findOneAndDelete(
      { _id: req.params.id, institution: req.institutionId }
    );
    if (!domainObj) return errorResponse(res, 404, "Domain not found");
    return successResponse(res, 200, "Domain removed", domainObj);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  createOfficer,
  updateOfficer,
  deactivateOfficer,
  getDomains,
  addDomain,
  verifyDomain,
  removeDomain
};

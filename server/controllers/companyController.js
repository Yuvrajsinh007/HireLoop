const Company      = require("../models/Company");
const PlacementDrive = require("../models/PlacementDrive");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── GET ALL COMPANIES (global list — any logged-in user) ────────────────
// GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 12, industry, search, sort = "name" } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = { isActive: true };

    if (industry) filter.industry = industry;
    if (search)   filter.$text    = { $search: search };

    const [companies, total] = await Promise.all([
      Company.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).select("-__v"),
      Company.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Companies fetched", {
      companies,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET SINGLE COMPANY ───────────────────────────────────────────────────
// GET /api/companies/:id
const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate("addedBy", "name");
    if (!company) return errorResponse(res, 404, "Company not found");
    return successResponse(res, 200, "Company fetched", company);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── SEARCH COMPANIES ─────────────────────────────────────────────────────
// GET /api/companies/search?q=tcs
const searchCompanies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return successResponse(res, 200, "Search results", []);

    const companies = await Company.find({
      name:     { $regex: q, $options: "i" },
      isActive: true,
    })
      .select("name logo industry")
      .limit(10);

    return successResponse(res, 200, "Search results", companies);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── CREATE COMPANY (officer/admin — adds to global list) ─────────────────
// POST /api/companies
const createCompany = async (req, res) => {
  try {
    const { name, website, industry, description, headquarters } = req.body;

    if (!name) return errorResponse(res, 400, "Company name is required");

    const exists = await Company.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (exists) return errorResponse(res, 400, "Company with this name already exists");

    const company = await Company.create({
      name, website, industry, description, headquarters,
      addedBy: req.user._id,
    });

    return successResponse(res, 201, "Company created successfully", company);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE COMPANY (officer/admin) ──────────────────────────────────────
// PUT /api/companies/:id
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return errorResponse(res, 404, "Company not found");
    return successResponse(res, 200, "Company updated", company);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DELETE COMPANY (superAdmin/collegeAdmin only) ────────────────────────
// DELETE /api/companies/:id
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return errorResponse(res, 404, "Company not found");
    return successResponse(res, 200, "Company deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPLOAD LOGO ──────────────────────────────────────────────────────────
// POST /api/companies/:id/logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No image provided");

    const company = await Company.findById(req.params.id);
    if (!company) return errorResponse(res, 404, "Company not found");

    if (company.logoPublicId) {
      await deleteFromCloudinary(company.logoPublicId).catch(() => {});
    }

    const result = await uploadToCloudinary(req.file.buffer, "hireloop/company-logos", "image");
    company.logo          = result.secure_url;
    company.logoPublicId  = result.public_id;
    await company.save();

    return successResponse(res, 200, "Logo uploaded", { logo: result.secure_url });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET DRIVES FOR A COMPANY (tenant-scoped) ────────────────────────────
// GET /api/companies/:id/drives
const getCompanyDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find({
      company:     req.params.id,
      institution: req.institutionId,
    })
      .populate("company", "name logo")
      .sort({ driveDate: -1 })
      .limit(20);

    return successResponse(res, 200, "Company drives fetched", drives);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getCompanies, getCompany, searchCompanies,
  createCompany, updateCompany, deleteCompany,
  uploadLogo, getCompanyDrives,
};
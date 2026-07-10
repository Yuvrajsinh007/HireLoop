const Company = require("../models/Company");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── GET ALL COMPANIES ────────────────────────────────────────────────────
// GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 12, domain, search, driveStatus, sort = "-createdAt" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { isActive: true };
    if (domain)      filter.domain      = domain;
    if (driveStatus) filter.driveStatus = driveStatus;
    if (search)      filter.$text       = { $search: search };

    const [companies, total] = await Promise.all([
      Company.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).select("-__v"),
      Company.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Companies fetched", {
      companies,
      total,
      page: parseInt(page),
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
    const company = await Company.findById(req.params.id).populate("addedBy", "name");
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
      name: { $regex: q, $options: "i" },
      isActive: true,
    })
      .select("name logo domain driveStatus")
      .limit(10);

    return successResponse(res, 200, "Search results", companies);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── CREATE COMPANY ───────────────────────────────────────────────────────
// POST /api/companies  (officer/admin only)
const createCompany = async (req, res) => {
  try {
    const {
      name, website, domain, description, headquarters,
      rounds, skillsRequired, minCGPA, eligibleBranches,
      upcomingDriveDate, driveStatus,
    } = req.body;

    if (!name) return errorResponse(res, 400, "Company name is required");

    const exists = await Company.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (exists) return errorResponse(res, 400, "Company with this name already exists");

    const company = await Company.create({
      name, website, domain, description, headquarters,
      rounds: rounds || [],
      skillsRequired: skillsRequired || [],
      minCGPA: minCGPA || 0,
      eligibleBranches: eligibleBranches || [],
      upcomingDriveDate,
      driveStatus: driveStatus || "none",
      addedBy: req.user._id,
    });

    return successResponse(res, 201, "Company created successfully", company);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE COMPANY ───────────────────────────────────────────────────────
// PUT /api/companies/:id  (officer/admin only)
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

// ─── DELETE COMPANY ───────────────────────────────────────────────────────
// DELETE /api/companies/:id  (admin only)
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
// POST /api/companies/:id/logo  (officer/admin only)
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No image provided");

    const company = await Company.findById(req.params.id);
    if (!company) return errorResponse(res, 404, "Company not found");

    if (company.logoPublicId) {
      await deleteFromCloudinary(company.logoPublicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, "hireloop/company-logos", "image");
    company.logo = result.secure_url;
    company.logoPublicId = result.public_id;
    await company.save();

    return successResponse(res, 200, "Logo uploaded", { logo: result.secure_url });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── RATE COMPANY DIFFICULTY ──────────────────────────────────────────────
// POST /api/companies/:id/rate
const rateCompany = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return errorResponse(res, 400, "Rating must be between 1 and 5");

    const company = await Company.findById(req.params.id);
    if (!company) return errorResponse(res, 404, "Company not found");

    // Simple rolling average
    const newTotal = company.totalRatings + 1;
    const newAvg   = ((company.difficultyRating * company.totalRatings) + rating) / newTotal;

    company.difficultyRating = Math.round(newAvg * 10) / 10;
    company.totalRatings     = newTotal;
    await company.save();

    return successResponse(res, 200, "Rating submitted", {
      difficultyRating: company.difficultyRating,
      totalRatings: company.totalRatings,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getCompanies, getCompany, searchCompanies,
  createCompany, updateCompany, deleteCompany,
  uploadLogo, rateCompany,
};
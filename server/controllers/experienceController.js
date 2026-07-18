const Experience = require("../models/Experience");
const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter, verifyTenantOwnership } = require("../middleware/tenantMiddleware");

// ─── GET ALL EXPERIENCES (tenant-scoped) ──────────────────────────────────
// GET /api/experiences
const getExperiences = async (req, res) => {
  try {
    const {
      page = 1, limit = 10,
      company, outcome, year, branch,
      difficulty, sort = "-createdAt",
    } = req.query;

    const skip   = (parseInt(page) - 1) * parseInt(limit);

    // Only show verified experiences to regular members
    // Officers/admins can see all
    const isStaff = ["officer","collegeAdmin","superAdmin"].includes(req.user.role);
    const filter  = tenantFilter(req, {});
    if (!isStaff) filter.isVerified = true;

    if (company)    filter.company           = company;
    if (outcome)    filter.outcome           = outcome;
    if (year)       filter.year              = parseInt(year);
    if (branch)     filter.branch            = branch;
    if (difficulty) filter.overallDifficulty = difficulty;

    const [experiences, total] = await Promise.all([
      Experience.find(filter)
        .populate("company", "name logo industry")
        .populate("author",  "name avatar role academicStatus")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-rounds"),
      Experience.countDocuments(filter),
    ]);

    const masked = experiences.map((exp) => {
      const e = exp.toObject();
      if (e.isAnonymous) e.author = { name: "Anonymous", avatar: "" };
      return e;
    });

    return successResponse(res, 200, "Experiences fetched", {
      experiences: masked,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET SINGLE EXPERIENCE ────────────────────────────────────────────────
// GET /api/experiences/:id
const getExperience = async (req, res) => {
  try {
    const isStaff = ["officer","collegeAdmin","superAdmin"].includes(req.user.role);
    const filter  = tenantFilter(req, { _id: req.params.id });
    if (!isStaff) filter.isVerified = true;

    const exp = await Experience.findOne(filter)
      .populate("company", "name logo industry website rounds")
      .populate("author",  "name avatar role academicStatus")
      .populate("verifiedBy", "name");

    if (!exp) return errorResponse(res, 404, "Experience not found");

    const e = exp.toObject();
    if (e.isAnonymous) e.author = { name: "Anonymous", avatar: "" };

    return successResponse(res, 200, "Experience fetched", e);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── CREATE EXPERIENCE ────────────────────────────────────────────────────
// POST /api/experiences
const createExperience = async (req, res) => {
  try {
    const {
      companyId, role, year, batch, branch,
      outcome, ctc, overallDifficulty,
      summary, rounds, tips, resourcesUsed, isAnonymous,
    } = req.body;

    if (!companyId || !role || !outcome || !summary)
      return errorResponse(res, 400, "Company, role, outcome, and summary are required");

    if (summary.length < 50)
      return errorResponse(res, 400, "Summary must be at least 50 characters");

    // Auto-verify if posted by officer/admin
    const isStaff  = ["officer","collegeAdmin","superAdmin"].includes(req.user.role);
    const verified = isStaff;

    const experience = await Experience.create({
      institution: req.institutionId,
      author:      req.user._id,
      company:     companyId,
      role, year, batch, branch,
      outcome,
      ctc:              outcome === "Selected" ? ctc : null,
      overallDifficulty,
      summary,
      rounds:           rounds       || [],
      tips,
      resourcesUsed:    resourcesUsed || [],
      isAnonymous:      isAnonymous   || false,
      isVerified:       verified,
      verifiedBy:       verified ? req.user._id : null,
    });

    await experience.populate("company", "name logo");
    await experience.populate("author",  "name avatar");

    return successResponse(res, 201, "Experience posted successfully", experience);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE EXPERIENCE ────────────────────────────────────────────────────
// PUT /api/experiences/:id
const updateExperience = async (req, res) => {
  try {
    const exp = await Experience.findOne({
      _id:         req.params.id,
      institution: req.institutionId,
      author:      req.user._id,
    });
    if (!exp) return errorResponse(res, 404, "Experience not found or not yours");

    const updatable = [
      "role","year","batch","branch","outcome","ctc",
      "overallDifficulty","summary","rounds","tips",
      "resourcesUsed","isAnonymous",
    ];
    updatable.forEach((key) => {
      if (req.body[key] !== undefined) exp[key] = req.body[key];
    });

    // Reset verification after edit
    exp.isVerified = false;
    exp.verifiedBy = null;

    await exp.save();
    return successResponse(res, 200, "Experience updated", exp);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DELETE EXPERIENCE ────────────────────────────────────────────────────
// DELETE /api/experiences/:id
const deleteExperience = async (req, res) => {
  try {
    const isStaff = ["collegeAdmin","superAdmin"].includes(req.user.role);
    const filter  = isStaff
      ? tenantFilter(req, { _id: req.params.id })
      : { _id: req.params.id, institution: req.institutionId, author: req.user._id };

    const exp = await Experience.findOneAndDelete(filter);
    if (!exp) return errorResponse(res, 404, "Experience not found");
    return successResponse(res, 200, "Experience deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPVOTE EXPERIENCE ────────────────────────────────────────────────────
// POST /api/experiences/:id/upvote
const upvoteExperience = async (req, res) => {
  try {
    const exp = await Experience.findOne(
      tenantFilter(req, { _id: req.params.id })
    );
    if (!exp) return errorResponse(res, 404, "Experience not found");

    const alreadyUpvoted = exp.upvotes.includes(req.user._id);

    if (alreadyUpvoted) {
      exp.upvotes     = exp.upvotes.filter((id) => id.toString() !== req.user._id.toString());
      exp.upvoteCount = Math.max(0, exp.upvoteCount - 1);
    } else {
      exp.upvotes.push(req.user._id);
      exp.upvoteCount += 1;

      if (exp.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient:         exp.author,
          institution:       req.institutionId,
          type:              "upvote",
          title:             "Someone upvoted your experience",
          message:           "Your interview experience got a new upvote!",
          link:              `/experiences/${exp._id}`,
          relatedExperience: exp._id,
        });
      }
    }

    await exp.save();

    return successResponse(res, 200, alreadyUpvoted ? "Upvote removed" : "Upvoted!", {
      upvoteCount: exp.upvoteCount,
      hasUpvoted:  !alreadyUpvoted,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── VERIFY EXPERIENCE (officer/admin) ────────────────────────────────────
// PUT /api/experiences/:id/verify
const verifyExperience = async (req, res) => {
  try {
    const exp = await Experience.findOneAndUpdate(
      tenantFilter(req, { _id: req.params.id }),
      { isVerified: true, verifiedBy: req.user._id },
      { new: true }
    );
    if (!exp) return errorResponse(res, 404, "Experience not found");
    return successResponse(res, 200, "Experience verified", exp);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET EXPERIENCES BY COMPANY (tenant-scoped) ───────────────────────────
// GET /api/experiences/company/:companyId
const getByCompany = async (req, res) => {
  try {
    const isStaff = ["officer","collegeAdmin","superAdmin"].includes(req.user.role);
    const filter  = tenantFilter(req, { company: req.params.companyId });
    if (!isStaff) filter.isVerified = true;

    const experiences = await Experience.find(filter)
      .populate("author", "name avatar role academicStatus")
      .sort("-createdAt")
      .select("-rounds");

    return successResponse(res, 200, "Company experiences fetched", experiences);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET MY EXPERIENCES ───────────────────────────────────────────────────
// GET /api/experiences/my
const getMyExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({
      author:      req.user._id,
      institution: req.institutionId,
    })
      .populate("company", "name logo")
      .sort("-createdAt");

    return successResponse(res, 200, "Your experiences fetched", experiences);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getExperiences, getExperience,
  createExperience, updateExperience, deleteExperience,
  upvoteExperience, verifyExperience,
  getByCompany, getMyExperiences,
};
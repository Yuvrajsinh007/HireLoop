const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      "Aptitude Test",
      "Coding Test",
      "Group Discussion",
      "Technical Interview",
      "HR Interview",
      "Management Round",
      "Other",
    ],
  },
  description: {
    type: String,
    default: "",
  },
  duration: {
    type: String, // e.g. "60 mins"
    default: "",
  },
});

const visitSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  studentsSelected: { type: Number, default: 0 },
  ctcOffered: { type: Number, default: 0 }, // in LPA
  rolesOffered: [String],
});

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
    },
    logo: {
      type: String,
      default: "",
    },
    logoPublicId: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    domain: {
      type: String,
      enum: [
        "Product",
        "Service",
        "FinTech",
        "EdTech",
        "HealthTech",
        "E-Commerce",
        "Consulting",
        "Core",
        "Other",
      ],
      default: "Other",
    },
    description: {
      type: String,
      default: "",
    },
    headquarters: {
      type: String,
      default: "",
    },
    rounds: [roundSchema],
    visitHistory: [visitSchema],
    skillsRequired: {
      type: [String],
      default: [],
    },
    minCGPA: {
      type: Number,
      default: 0,
    },
    eligibleBranches: {
      type: [String],
      default: [],
    },
    averageCTC: {
      type: Number,
      default: 0,
    },
    difficultyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    upcomingDriveDate: {
      type: Date,
      default: null,
    },
    driveStatus: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

// Index for search
companySchema.index({ name: "text", description: "text" });

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
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
  description: { type: String, default: "" },
  duration: { type: String, default: "" },
});

const placementDriveSchema = new mongoose.Schema(
  {
    // ─── Tenant ───────────────────────────────────────────────────────────
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // ─── Company ──────────────────────────────────────────────────────────
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // ─── Drive Info ───────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Drive title is required"],
      trim: true,
    },
    driveType: {
      type: String,
      enum: ["ON_CAMPUS", "OFF_CAMPUS", "POOL_CAMPUS", "VIRTUAL"],
      default: "ON_CAMPUS",
    },
    academicYear: { type: String, default: "" }, // e.g. "2024-25"
    driveDate: { type: Date, default: null },
    applicationDeadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },

    // ─── Eligibility ──────────────────────────────────────────────────────
    eligiblePrograms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program",
      },
    ],
    minCGPA: { type: Number, default: 0 },
    maxBacklogs: { type: Number, default: 0 },
    graduationYears: { type: [Number], default: [] },
    eligibilityCriteria: { type: String, default: "" },

    // ─── Job Details ──────────────────────────────────────────────────────
    roles: [
      {
        title: { type: String, required: true },
        employmentType: {
          type: String,
          enum: ["Full-Time", "Intern", "PPO", "Contract"],
          default: "Full-Time",
        },
        ctcFixed: { type: Number, default: null },
        ctcVariable: { type: Number, default: null },
        ctcTotal: { type: Number, default: null },
        stipend: { type: Number, default: null },
        openings: { type: Number, default: null },
        location: { type: String, default: "" },
        bond: { type: String, default: "" },
      },
    ],

    // ─── Process ──────────────────────────────────────────────────────────
    rounds: [roundSchema],
    skillsRequired: { type: [String], default: [] },

    // ─── Documents & Resources ────────────────────────────────────────────
    description: { type: String, default: "" },
    resourceLinks: { type: [String], default: [] },

    // ─── Management ───────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Results Summary ──────────────────────────────────────────────────
    totalSelected: { type: Number, default: 0 },
    averageCTC: { type: Number, default: 0 },
    highestCTC: { type: Number, default: 0 },
  },
  { timestamps: true }
);

placementDriveSchema.index({ institution: 1, status: 1 });
placementDriveSchema.index({ institution: 1, driveDate: -1 });
placementDriveSchema.index({ institution: 1, company: 1 });

const PlacementDrive = mongoose.model("PlacementDrive", placementDriveSchema);
module.exports = PlacementDrive;
const mongoose = require("mongoose");

const employmentHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // ─── Company Info ─────────────────────────────────────────────────────
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    // Link to global company if exists
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    // ─── Role Info ────────────────────────────────────────────────────────
    jobTitle: { type: String, trim: true, default: "" },
    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Intern", "Contract", "Freelance"],
      default: "Full-Time",
    },
    ctc: { type: Number, default: null }, // in LPA
    stipend: { type: Number, default: null }, // in INR per month (for interns)

    // ─── Timeline ─────────────────────────────────────────────────────────
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: true },

    // ─── Source ───────────────────────────────────────────────────────────
    // Was this job obtained through campus placement?
    isViaCampus: { type: Boolean, default: false },
    placementDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      default: null,
    },

    description: { type: String, default: "" },
  },
  { timestamps: true }
);

employmentHistorySchema.index({ user: 1, isCurrent: -1 });
employmentHistorySchema.index({ institution: 1 });

const EmploymentHistory = mongoose.model("EmploymentHistory", employmentHistorySchema);
module.exports = EmploymentHistory;
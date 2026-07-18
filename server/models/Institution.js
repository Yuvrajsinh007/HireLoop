const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: [
        "University",
        "Deemed University",
        "Autonomous College",
        "Affiliated College",
        "Institute of Technology",
        "Polytechnic",
        "Other",
      ],
      default: "Autonomous College",
    },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },

    // ─── Contact & Location ───────────────────────────────────────────────
    address: {
      street:  { type: String, default: "" },
      city:    { type: String, default: "" },
      state:   { type: String, default: "" },
      country: { type: String, default: "India" },
      pincode: { type: String, default: "" },
    },
    contactEmail: { type: String, trim: true, lowercase: true, default: "" },
    contactPhone: { type: String, default: "" },

    // ─── Academic Structure Labels (customizable per institution) ─────────
    // Allows "Institute" or "School" or "Faculty" — whatever the college uses
    academicUnitLabel: { type: String, default: "Institute" },
    programLabel:      { type: String, default: "Branch" },

    // ─── Platform Approval ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },

    // ─── Primary Admin ────────────────────────────────────────────────────
    primaryAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ─── Settings ─────────────────────────────────────────────────────────
    settings: {
      allowStudentSelfRegister:  { type: Boolean, default: true  },
      requireEmailVerification:  { type: Boolean, default: true  },
      requireAdminApprovalForStudent: { type: Boolean, default: false },
      allowAlumniSelfRegister:   { type: Boolean, default: true  },
      requireAlumniVerification: { type: Boolean, default: true  },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

institutionSchema.index({ name: "text" });

const Institution = mongoose.model("Institution", institutionSchema);
module.exports = Institution;
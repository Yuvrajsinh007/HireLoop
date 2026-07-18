const mongoose = require("mongoose");

// ─── GLOBAL COMPANY ───────────────────────────────────────────────────────
// Platform-wide company record (e.g. "TCS", "Google")
// Not tied to any institution — prevents duplication across colleges

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
    },
    logo: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
    website: { type: String, default: "" },
    industry: {
      type: String,
      enum: [
        "Product",
        "Service",
        "FinTech",
        "EdTech",
        "HealthTech",
        "E-Commerce",
        "Consulting",
        "Core Engineering",
        "Banking & Finance",
        "Government / PSU",
        "Startup",
        "Other",
      ],
      default: "Other",
    },
    description: { type: String, default: "" },
    headquarters: { type: String, default: "" },

    // ─── Who added it ─────────────────────────────────────────────────────
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

companySchema.index({ name: "text", description: "text" });
companySchema.index({ name: 1 });

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
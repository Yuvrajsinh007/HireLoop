const mongoose = require("mongoose");

const institutionRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true, default: "" },
    type: { type: String, default: "Autonomous College" },
    website: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    logo: { type: String, default: "" },
    registrationContactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    primaryAdminName: { type: String, required: true, trim: true },
    primaryAdminEmail: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored hashed
    emailDomains: [{ type: String, lowercase: true, trim: true }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstitutionRequest", institutionRequestSchema);
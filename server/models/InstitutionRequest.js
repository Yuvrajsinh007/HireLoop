const mongoose = require("mongoose");

const institutionRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    type: { type: String, default: "Autonomous College" },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    logo: { type: String },
    
    // Contact Info
    registrationContactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    
    // Address
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    // Admin Details
    primaryAdminName: { type: String, required: true, trim: true },
    primaryAdminEmail: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // Not hashed yet until approval, or we can hash it here
    
    emailDomains: [{ type: String, lowercase: true, trim: true }],

    status: {
      type: String,
      enum: ["pending", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

const InstitutionRequest = mongoose.model("InstitutionRequest", institutionRequestSchema);
module.exports = InstitutionRequest;

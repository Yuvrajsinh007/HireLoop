const mongoose = require("mongoose");

const institutionDomainSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    // e.g. "charusat.edu.in", "ec.charusat.ac.in"
    domain: {
      type: String,
      required: [true, "Domain is required"],
      trim: true,
      lowercase: true,
    },
    // What type of users this domain is for
    allowedFor: {
      type: [String],
      enum: ["student", "alumni", "staff"],
      default: ["student"],
    },
    isVerified: { type: Boolean, default: false },
    isPrimary:  { type: Boolean, default: false },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// One domain can only belong to one institution
institutionDomainSchema.index({ domain: 1 }, { unique: true });
institutionDomainSchema.index({ institution: 1 });

const InstitutionDomain = mongoose.model("InstitutionDomain", institutionDomainSchema);
module.exports = InstitutionDomain;
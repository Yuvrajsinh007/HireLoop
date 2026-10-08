const mongoose = require("mongoose");

const memberProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ─── Tenant ───────────────────────────────────────────────────────────
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // ─── Academic Structure ───────────────────────────────────────────────
    academicUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      default: null,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      default: null,
    },

    // ─── Academic Info ────────────────────────────────────────────────────
    phone: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },
    rollNumber: { type: String, trim: true, default: "" },
    enrollmentYear: { type: Number, default: null },
    graduationYear: { type: Number, default: null },
    cgpa: { type: Number, min: 0, max: 10, default: null },
    activeBacklogs: { type: Number, default: 0 },

    // ─── Skills & Resume ──────────────────────────────────────────────────
    skills: { type: [String], default: [] },
    programmingLanguages: { type: [String], default: [] },
    technicalSkills: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    resumeUrl: { type: String, default: "" },
    resumePublicId: { type: String, default: "" },
    offerLetterUrl: { type: String, default: "" },
    offerLetterPublicId: { type: String, default: "" },
    offerCompany: { type: String, default: "" },
    offerRole: { type: String, default: "" },
    offerCtc: { type: Number, default: null },
    offerDate: { type: Date, default: null },
    joiningDate: { type: Date, default: null },
    offerVerificationStatus: {
      type: String,
      enum: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
      default: "NONE",
    },

    // ─── Social Links ─────────────────────────────────────────────────────
    linkedIn: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },

    // ─── Bio ──────────────────────────────────────────────────────────────
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    // ─── Saved Experiences ────────────────────────────────────────────────
    savedExperiences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience",
      },
    ],

    // ─── Profile Completeness Tracking ────────────────────────────────────
    profileCompletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
memberProfileSchema.index({ institution: 1 });
memberProfileSchema.index({ institution: 1, program: 1 });
memberProfileSchema.index({ institution: 1, graduationYear: 1 });

const MemberProfile = mongoose.model("MemberProfile", memberProfileSchema);
module.exports = MemberProfile;
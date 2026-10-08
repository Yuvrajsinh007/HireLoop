const mongoose = require("mongoose");

const stageLogSchema = new mongoose.Schema({
  previousStage: { type: String, default: "" },
  stage: { type: String, required: true },
  note:  { type: String, default: "" },
  date:  { type: Date, default: Date.now },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  source: {
    type: String,
    enum: ["student", "officer", "system"],
    default: "student",
  },
});

const applicationSchema = new mongoose.Schema(
  {
    // ─── Tenant ───────────────────────────────────────────────────────────
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // ─── References ───────────────────────────────────────────────────────
    // student here references the User directly (not MemberProfile)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      default: null,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    role: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },

    currentStage: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Aptitude Test",
        "Coding Test",
        "Group Discussion",
        "Technical Interview",
        "HR Interview",
        "Management Round",
        "Offer Received",
        "Joined",
        "Rejected",
        "On Hold",
        "Withdrew",
      ],
      default: "Applied",
    },
    stageHistory: [stageLogSchema],

    ctcOffered: { type: Number, default: null },
    offerLetterUrl: { type: String, default: "" },
    offerLetterPublicId: { type: String, default: "" },
    offerDate: { type: Date, default: null },
    joiningDate: { type: Date, default: null },
    offerVerificationStatus: {
      type: String,
      enum: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
      default: "NONE",
    },
    offerVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    applyDate: { type: Date, default: Date.now },
    notes: {
      type: String,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, drive: 1, institution: 1 }, { unique: true, sparse: true });
applicationSchema.index({ student: 1, company: 1, institution: 1 });
applicationSchema.index({ institution: 1, student: 1 });
applicationSchema.index({ institution: 1, drive: 1 });
applicationSchema.index({ institution: 1, currentStage: 1 });

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
const mongoose = require("mongoose");

const guidanceRequestSchema = new mongoose.Schema(
  {
    // ─── Tenant ───────────────────────────────────────────────────────────
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // ─── Requester (Student) ──────────────────────────────────────────────
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── What they need help with ─────────────────────────────────────────
    targetCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    targetCompanyName: { type: String, default: "" }, // if company not in DB
    targetRole: { type: String, default: "" },
    topic: {
      type: String,
      enum: [
        "Interview Preparation",
        "Resume Review",
        "DSA Help",
        "Career Guidance",
        "Company Specific Prep",
        "Mock Interview",
        "General Advice",
        "Other",
      ],
      default: "Interview Preparation",
    },
    description: {
      type: String,
      required: [true, "Please describe what you need help with"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    preferredSessionType: {
      type: String,
      enum: ["One-on-One", "Group Session", "Either"],
      default: "Either",
    },

    // ─── Status Workflow ──────────────────────────────────────────────────
    // PENDING_REVIEW → officer reviews
    // ALUMNI_CONTACTED → officer contacted an alumni
    // ALUMNI_ACCEPTED → alumni agreed
    // ALUMNI_DECLINED → alumni declined, officer may try another
    // SESSION_SCHEDULED → officer created a session
    // COMPLETED → session done
    // CLOSED → closed without session
    status: {
      type: String,
      enum: [
        "PENDING_REVIEW",
        "ALUMNI_CONTACTED",
        "ALUMNI_ACCEPTED",
        "ALUMNI_DECLINED",
        "SESSION_SCHEDULED",
        "COMPLETED",
        "CLOSED",
      ],
      default: "PENDING_REVIEW",
    },

    // ─── Officer Assignment ───────────────────────────────────────────────
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    officerNotes: { type: String, default: "" },

    // ─── Alumni Assignment (set by officer, NOT visible to student) ───────
    assignedAlumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    alumniContactedAt: { type: Date, default: null },
    alumniRespondedAt: { type: Date, default: null },
    alumniDeclineReason: { type: String, default: "" },

    // ─── Session Reference ────────────────────────────────────────────────
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorshipSession",
      default: null,
    },

    closedAt: { type: Date, default: null },
    closedReason: { type: String, default: "" },
  },
  { timestamps: true }
);

guidanceRequestSchema.index({ institution: 1, status: 1 });
guidanceRequestSchema.index({ institution: 1, requestedBy: 1 });
guidanceRequestSchema.index({ institution: 1, assignedAlumni: 1 });

const GuidanceRequest = mongoose.model("GuidanceRequest", guidanceRequestSchema);
module.exports = GuidanceRequest;
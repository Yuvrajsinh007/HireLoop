const mongoose = require("mongoose");

const mentorshipSessionSchema = new mongoose.Schema(
  {
    // ─── Tenant ───────────────────────────────────────────────────────────
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // ─── Created & Owned by Officer ───────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Alumni (facilitator) ─────────────────────────────────────────────
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Students (participants) ──────────────────────────────────────────
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ─── Linked Guidance Requests ─────────────────────────────────────────
    guidanceRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GuidanceRequest",
      },
    ],

    // ─── Session Details ──────────────────────────────────────────────────
    title: { type: String, required: true, trim: true },
    sessionType: {
      type: String,
      enum: [
        "Mock Interview",
        "Resume Review",
        "Company Prep",
        "DSA Session",
        "Career Guidance",
        "Group Webinar",
        "Q&A Session",
        "Other",
      ],
      default: "Mock Interview",
    },
    description: { type: String, default: "" },

    // ─── Schedule ─────────────────────────────────────────────────────────
    scheduledDate: { type: Date, required: true },
    startTime: { type: String, default: "" }, // "10:00"
    endTime: { type: String, default: "" },   // "11:00"
    durationMinutes: { type: Number, default: 60 },

    // ─── Meeting Link (only officer and participants see this) ────────────
    meetLink: { type: String, default: "" },
    meetingPlatform: {
      type: String,
      enum: ["Google Meet", "Zoom", "Microsoft Teams", "Offline", "Other"],
      default: "Google Meet",
    },

    // ─── Status ───────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },

    // ─── Feedback ─────────────────────────────────────────────────────────
    alumniRating: { type: Number, min: 1, max: 5, default: null },
    alumniFeedback: { type: String, default: "" },
    studentFeedbacks: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        feedback: { type: String, default: "" },
      },
    ],

    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    cancelReason: { type: String, default: "" },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

mentorshipSessionSchema.index({ institution: 1, status: 1 });
mentorshipSessionSchema.index({ institution: 1, alumni: 1 });
mentorshipSessionSchema.index({ institution: 1, scheduledDate: 1 });

const MentorshipSession = mongoose.model("MentorshipSession", mentorshipSessionSchema);
module.exports = MentorshipSession;
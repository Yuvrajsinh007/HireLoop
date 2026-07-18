const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Tenant scoping ───────────────────────────────────────────────────
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "new_drive",
        "application_update",
        "new_experience",
        "guidance_request_update",
        "session_scheduled",
        "session_cancelled",
        "session_reminder",
        "upvote",
        "alumni_contacted",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false },

    // ─── Optional references ──────────────────────────────────────────────
    relatedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
    relatedExperience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      default: null,
    },
    relatedGuidanceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuidanceRequest",
      default: null,
    },
    relatedSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorshipSession",
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ institution: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
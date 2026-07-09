const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "new_drive",           // New company drive announced
        "application_update",  // Application stage changed
        "new_experience",      // New experience posted for a company
        "booking_confirmed",   // Mentor booking confirmed
        "booking_cancelled",   // Mentor booking cancelled
        "slot_reminder",       // Upcoming mentor slot reminder
        "upvote",              // Someone upvoted your experience
        "system",              // General system notification
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // Frontend route to redirect on click
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Optional references
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
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Index for fast user notification queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
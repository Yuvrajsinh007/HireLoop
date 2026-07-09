const mongoose = require("mongoose");

const mentorSlotSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Slot date is required"],
    },
    startTime: {
      type: String, // e.g. "10:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "10:30"
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    topic: {
      type: String,
      enum: [
        "Mock Interview",
        "Resume Review",
        "DSA Help",
        "Career Guidance",
        "Company Specific Prep",
        "General Advice",
        "Other",
      ],
      default: "Mock Interview",
    },
    description: {
      type: String,
      default: "",
      maxlength: 300,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    meetLink: {
      type: String, // Google Meet or any link
      default: "",
    },
    status: {
      type: String,
      enum: ["available", "booked", "completed", "cancelled"],
      default: "available",
    },
  },
  { timestamps: true }
);

const MentorSlot = mongoose.model("MentorSlot", mentorSlotSchema);
module.exports = MentorSlot;
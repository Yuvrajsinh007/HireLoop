const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorSlot",
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "completed", "cancelled", "no_show"],
      default: "confirmed",
    },
    menteeNote: {
      type: String,
      default: "",
      maxlength: 300,
    },
    mentorFeedback: {
      type: String,
      default: "",
      maxlength: 500,
    },
    menteeFeedback: {
      type: String,
      default: "",
      maxlength: 500,
    },
    menteeRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ["mentor", "mentee", null],
      default: null,
    },
    cancelReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
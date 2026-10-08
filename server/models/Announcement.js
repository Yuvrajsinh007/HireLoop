const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    target: {
      type: String,
      enum: ["ALL", "INSTITUTE", "PROGRAM", "GRADUATION_YEAR", "DRIVE"],
      default: "ALL",
    },
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
    graduationYear: { type: Number, default: null },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      default: null,
    },
    scheduledFor: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["DRAFT", "SCHEDULED", "SENT"],
      default: "DRAFT",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stats: {
      targeted: { type: Number, default: 0 },
      notified: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

announcementSchema.index({ institution: 1, createdAt: -1 });
announcementSchema.index({ status: 1, scheduledFor: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;

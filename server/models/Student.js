const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      default: "",
    },
    branch: {
      type: String,
      enum: [
        "Computer Engineering",
        "Information Technology",
        "Electronics & Communication",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Chemical Engineering",
        "Other",
      ],
      default: "Computer Engineering",
    },
    batch: {
      type: Number, // e.g. 2025
      default: null,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    resumePublicId: {
      type: String,
      default: "",
    },
    linkedIn: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    portfolio: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
      default: "",
    },
    isAvailableForMentorship: {
      type: Boolean,
      default: false,
    },
    placementStatus: {
      type: String,
      enum: ["not_started", "searching", "placed", "higher_studies"],
      default: "not_started",
    },
    placedAt: {
      type: String, // Company name
      default: "",
    },
    ctc: {
      type: Number, // in LPA
      default: null,
    },
    savedExperiences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience",
      },
    ],
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
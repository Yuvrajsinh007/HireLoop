const mongoose = require("mongoose");

const stageLogSchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
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
    ctcOffered: {
      type: Number, // in LPA
      default: null,
    },
    offerLetterUrl: {
      type: String,
      default: "",
    },
    offerLetterPublicId: {
      type: String,
      default: "",
    },
    applyDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    isPrivate: {
      type: Boolean,
      default: false, // If true, only the student can see it
    },
  },
  { timestamps: true }
);

// One student can apply to a company only once
applicationSchema.index({ student: 1, company: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
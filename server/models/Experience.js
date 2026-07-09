const mongoose = require("mongoose");

const roundDetailSchema = new mongoose.Schema({
  roundName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  questionsAsked: {
    type: [String],
    default: [],
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  outcome: {
    type: String,
    enum: ["Cleared", "Eliminated", "Pending"],
    default: "Cleared",
  },
});

const experienceSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    batch: {
      type: Number, // graduation year
      default: null,
    },
    branch: {
      type: String,
      default: "",
    },
    outcome: {
      type: String,
      enum: ["Selected", "Rejected", "On Hold", "Withdrew"],
      required: true,
    },
    ctc: {
      type: Number, // in LPA, visible only if selected
      default: null,
    },
    overallDifficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
      minlength: [50, "Summary must be at least 50 characters"],
      maxlength: [2000, "Summary cannot exceed 2000 characters"],
    },
    rounds: [roundDetailSchema],
    tips: {
      type: String,
      default: "",
      maxlength: [1000, "Tips cannot exceed 1000 characters"],
    },
    resourcesUsed: {
      type: [String], // e.g. ["LeetCode", "GFG", "Striver DSA"]
      default: [],
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false, // Admin can verify
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for search and filter
experienceSchema.index({ company: 1, year: -1 });
experienceSchema.index({ outcome: 1 });

const Experience = mongoose.model("Experience", experienceSchema);
module.exports = Experience;
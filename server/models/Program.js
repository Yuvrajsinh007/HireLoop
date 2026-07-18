const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    academicUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    degreeType: {
      type: String,
      enum: ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "MBA", "B.E", "M.E", "Diploma", "Ph.D", "Other"],
      default: "B.Tech",
    },
    durationYears: { type: Number, default: 4 },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique program name within an academic unit
programSchema.index({ academicUnit: 1, name: 1 }, { unique: true });
programSchema.index({ institution: 1 });

const Program = mongoose.model("Program", programSchema);
module.exports = Program;
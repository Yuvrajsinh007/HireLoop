const mongoose = require("mongoose");

const academicUnitSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Academic unit name is required"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    description: { type: String, default: "" },
    head:  { type: String, default: "" }, // Name of dean/director
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique name per institution
academicUnitSchema.index({ institution: 1, name: 1 }, { unique: true });

const AcademicUnit = mongoose.model("AcademicUnit", academicUnitSchema);
module.exports = AcademicUnit;
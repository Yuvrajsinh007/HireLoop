const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // ─── System Role (controls dashboard + API access) ────────────────────
    // superAdmin  = platform owner
    // collegeAdmin = manages one institution
    // officer     = placement operations staff
    // member      = student OR alumni (differentiated by academicStatus)
    role: {
      type: String,
      enum: ["superAdmin", "collegeAdmin", "officer", "member"],
      default: "member",
    },

    // ─── Institution (tenant) ─────────────────────────────────────────────
    // null only for superAdmin
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      default: null,
    },

    // ─── Academic Lifecycle Status ────────────────────────────────────────
    // ENROLLED       = current active student
    // FINAL_YEAR     = in final year of study
    // GRADUATED      = completed degree, now alumni
    // NOT_APPLICABLE = for officers, admins, superAdmins
    academicStatus: {
      type: String,
      enum: ["ENROLLED", "FINAL_YEAR", "GRADUATED", "NOT_APPLICABLE"],
      default: "ENROLLED",
    },

    // ─── Placement / Career Status ────────────────────────────────────────
    placementStatus: {
      type: String,
      enum: [
        "UNPLACED",
        "SEARCHING",
        "PLACED",
        "HIGHER_STUDIES",
        "NOT_PARTICIPATING",
        "NOT_APPLICABLE",
      ],
      default: "UNPLACED",
    },

    // ─── Employment Status (relevant after graduation) ────────────────────
    employmentStatus: {
      type: String,
      enum: ["STUDENT", "INTERN", "WORKING", "SEEKING", "HIGHER_STUDIES", "NOT_APPLICABLE"],
      default: "STUDENT",
    },

    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },

    // ─── Alternate email for alumni after losing college email ────────────
    alternateEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    // ─── Email Verification OTP ───────────────────────────────────────────
    emailVerifyOtp:         { type: String,  select: false },
    emailVerifyOtpExpire:   { type: Date,    select: false },
    emailVerifyOtpAttempts: { type: Number,  default: 0,    select: false },

    // ─── Login OTP ────────────────────────────────────────────────────────
    loginOtp:               { type: String,  select: false },
    loginOtpExpire:         { type: Date,    select: false },
    loginOtpAttempts:       { type: Number,  default: 0,    select: false },

    // ─── Password Reset OTP ───────────────────────────────────────────────
    resetOtp:               { type: String,  select: false },
    resetOtpExpire:         { type: Date,    select: false },
    resetOtpAttempts:       { type: Number,  default: 0,    select: false },
    resetOtpVerified:       { type: Boolean, default: false, select: false },

    // ─── Shared OTP rate limiting ─────────────────────────────────────────
    lastOtpSentAt:          { type: Date,    select: false },
  },
  { timestamps: true }
);

// ─── Hash password before saving ──────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Compare password ──────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── isAlumni helper ──────────────────────────────────────────────────────
userSchema.virtual("isAlumni").get(function () {
  return this.academicStatus === "GRADUATED";
});

// ─── isCurrentStudent helper ──────────────────────────────────────────────
userSchema.virtual("isCurrentStudent").get(function () {
  return ["ENROLLED", "FINAL_YEAR"].includes(this.academicStatus);
});

// ─── Avatar fallback ──────────────────────────────────────────────────────
userSchema.virtual("avatarUrl").get(function () {
  return (
    this.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=4F46E5&color=fff`
  );
});

// ─── Index for institution-scoped queries ─────────────────────────────────
userSchema.index({ institution: 1, role: 1 });
userSchema.index({ institution: 1, academicStatus: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
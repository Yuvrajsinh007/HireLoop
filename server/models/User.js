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
    role: {
      type: String,
      enum: ["student", "senior", "officer", "admin"],
      default: "student",
    },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },

    // ─── Email Verification OTP ──────────────────────────────────────────
    emailVerifyOtp:        { type: String,  select: false },
    emailVerifyOtpExpire:  { type: Date,    select: false },
    emailVerifyOtpAttempts:{ type: Number,  default: 0,    select: false },

    // ─── Login OTP ────────────────────────────────────────────────────────
    loginOtp:              { type: String,  select: false },
    loginOtpExpire:        { type: Date,    select: false },
    loginOtpAttempts:      { type: Number,  default: 0,    select: false },

    // ─── Password Reset OTP ───────────────────────────────────────────────
    resetOtp:              { type: String,  select: false },
    resetOtpExpire:        { type: Date,    select: false },
    resetOtpAttempts:      { type: Number,  default: 0,    select: false },
    resetOtpVerified:      { type: Boolean, default: false, select: false },

    // ─── Shared OTP rate limiting ─────────────────────────────────────────
    lastOtpSentAt:         { type: Date,    select: false },
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

// ─── Avatar fallback virtual ───────────────────────────────────────────────
userSchema.virtual("avatarUrl").get(function () {
  return (
    this.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=4F46E5&color=fff`
  );
});

const User = mongoose.model("User", userSchema);
module.exports = User;
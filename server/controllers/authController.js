const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User    = require("../models/User");
const Student = require("../models/Student");
const { generateToken } = require("../utils/generateToken");
const {
  sendWelcomeEmail,
  sendVerificationOtpEmail,
  sendLoginOtpEmail,
  sendPasswordResetOtpEmail,
} = require("../utils/sendEmail");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── HELPERS ──────────────────────────────────────────────────────────────

/** Generate a secure 6-digit numeric OTP */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/** Hash OTP before storing */
const hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/** Compare plain OTP with stored hash */
const compareOtp = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

/** Check OTP resend cooldown (60 seconds) */
const isOnCooldown = (lastSentAt) => {
  if (!lastSentAt) return false;
  const diff = (Date.now() - new Date(lastSentAt).getTime()) / 1000;
  return diff < 60;
};

/** Seconds remaining on cooldown */
const cooldownRemaining = (lastSentAt) => {
  if (!lastSentAt) return 0;
  const diff = Math.ceil(60 - (Date.now() - new Date(lastSentAt).getTime()) / 1000);
  return Math.max(0, diff);
};

// ─── REGISTER ──────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return errorResponse(res, 400, "Name, email and password are required");

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return errorResponse(res, 400, "Email already registered");

    const allowedRoles = ["student", "senior"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    const user = await User.create({ name, email, password, role: userRole });

    if (userRole === "student" || userRole === "senior") {
      await Student.create({ user: user._id });
    }

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail({ to: email, name });
    } catch (emailErr) {
      console.error("Welcome email error (ignored):", emailErr.message);
    }

    const token = generateToken(user._id, user.role);

    return successResponse(res, 201, "Registration successful! You can now use HireLoop.", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── PASSWORD LOGIN ────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return errorResponse(res, 400, "Email and password are required");

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return errorResponse(res, 401, "Invalid email or password");

    if (!user.isActive)
      return errorResponse(res, 401, "Your account has been deactivated. Contact admin.");

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return errorResponse(res, 401, "Invalid email or password");

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, "Login successful", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── SEND LOGIN OTP ────────────────────────────────────────────────────────
// POST /api/auth/send-login-otp
const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");

    const user = await User.findOne({ email }).select("+lastOtpSentAt +loginOtp +loginOtpExpire");
    // Generic response to prevent email enumeration
    if (!user)
      return successResponse(res, 200, "If this email is registered, an OTP has been sent.");

    if (!user.isActive)
      return errorResponse(res, 401, "Your account has been deactivated.");

    if (isOnCooldown(user.lastOtpSentAt)) {
      return errorResponse(res, 429, `Please wait ${cooldownRemaining(user.lastOtpSentAt)} seconds before requesting another OTP.`);
    }

    const otp    = generateOtp();
    const hashed = await hashOtp(otp);

    user.loginOtp         = hashed;
    user.loginOtpExpire   = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    user.loginOtpAttempts = 0;
    user.lastOtpSentAt    = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await sendLoginOtpEmail({ to: email, name: user.name, otp });
    } catch (emailErr) {
      console.error("Login OTP email error:", emailErr.message);
      return errorResponse(res, 500, "Could not send OTP email. Try again.");
    }

    return successResponse(res, 200, "OTP sent to your email. Valid for 10 minutes.");
  } catch (error) {
    console.error("Send login OTP error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── VERIFY LOGIN OTP ──────────────────────────────────────────────────────
// POST /api/auth/verify-login-otp
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, "Email and OTP are required");

    const user = await User.findOne({ email }).select(
      "+loginOtp +loginOtpExpire +loginOtpAttempts +isActive"
    );

    if (!user) return errorResponse(res, 401, "Invalid OTP");
    if (!user.isActive) return errorResponse(res, 401, "Account deactivated.");

    // Max 5 attempts
    if (user.loginOtpAttempts >= 5) {
      user.loginOtp         = undefined;
      user.loginOtpExpire   = undefined;
      user.loginOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 429, "Too many failed attempts. Please request a new OTP.");
    }

    if (!user.loginOtp || !user.loginOtpExpire)
      return errorResponse(res, 400, "No OTP found. Please request a new one.");

    if (new Date() > user.loginOtpExpire) {
      user.loginOtp         = undefined;
      user.loginOtpExpire   = undefined;
      user.loginOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 400, "OTP has expired. Please request a new one.");
    }

    const isValid = await compareOtp(otp.toString(), user.loginOtp);
    if (!isValid) {
      user.loginOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 401, `Invalid OTP. ${5 - user.loginOtpAttempts} attempts remaining.`);
    }

    // OTP valid — clear it
    user.loginOtp         = undefined;
    user.loginOtpExpire   = undefined;
    user.loginOtpAttempts = 0;
    user.lastLogin        = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, "Login successful", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── SEND EMAIL VERIFY OTP ─────────────────────────────────────────────────
// POST /api/auth/send-verify-otp  (protected — user must be logged in)
const sendVerifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "+emailVerifyOtp +emailVerifyOtpExpire +emailVerifyOtpAttempts +lastOtpSentAt"
    );

    if (!user) return errorResponse(res, 404, "User not found");

    if (user.isEmailVerified)
      return errorResponse(res, 400, "Email is already verified.");

    if (isOnCooldown(user.lastOtpSentAt)) {
      return errorResponse(res, 429, `Please wait ${cooldownRemaining(user.lastOtpSentAt)} seconds before requesting another OTP.`);
    }

    const otp    = generateOtp();
    const hashed = await hashOtp(otp);

    user.emailVerifyOtp         = hashed;
    user.emailVerifyOtpExpire   = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerifyOtpAttempts = 0;
    user.lastOtpSentAt          = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationOtpEmail({ to: user.email, name: user.name, otp });
    } catch (emailErr) {
      console.error("Verify OTP email error:", emailErr.message);
      return errorResponse(res, 500, "Could not send OTP email. Try again.");
    }

    return successResponse(res, 200, "OTP sent to your email. Valid for 10 minutes.");
  } catch (error) {
    console.error("Send verify OTP error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── VERIFY EMAIL OTP ──────────────────────────────────────────────────────
// POST /api/auth/verify-email-otp  (protected)
const verifyEmailOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return errorResponse(res, 400, "OTP is required");

    const user = await User.findById(req.user._id).select(
      "+emailVerifyOtp +emailVerifyOtpExpire +emailVerifyOtpAttempts"
    );

    if (!user) return errorResponse(res, 404, "User not found");
    if (user.isEmailVerified) return errorResponse(res, 400, "Email already verified.");

    if (user.emailVerifyOtpAttempts >= 5) {
      user.emailVerifyOtp         = undefined;
      user.emailVerifyOtpExpire   = undefined;
      user.emailVerifyOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 429, "Too many failed attempts. Please request a new OTP.");
    }

    if (!user.emailVerifyOtp || !user.emailVerifyOtpExpire)
      return errorResponse(res, 400, "No OTP found. Please request a new one.");

    if (new Date() > user.emailVerifyOtpExpire) {
      user.emailVerifyOtp         = undefined;
      user.emailVerifyOtpExpire   = undefined;
      user.emailVerifyOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 400, "OTP has expired. Please request a new one.");
    }

    const isValid = await compareOtp(otp.toString(), user.emailVerifyOtp);
    if (!isValid) {
      user.emailVerifyOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 401, `Invalid OTP. ${5 - user.emailVerifyOtpAttempts} attempts remaining.`);
    }

    // OTP valid — mark email as verified
    user.isEmailVerified        = true;
    user.emailVerifyOtp         = undefined;
    user.emailVerifyOtpExpire   = undefined;
    user.emailVerifyOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "Email verified successfully! ✅", {
      isEmailVerified: true,
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── FORGOT PASSWORD — SEND OTP ───────────────────────────────────────────
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");

    const user = await User.findOne({ email }).select("+lastOtpSentAt +resetOtp +resetOtpExpire");

    // Generic response
    if (!user)
      return successResponse(res, 200, "If this email is registered, an OTP has been sent.");

    if (isOnCooldown(user.lastOtpSentAt)) {
      return errorResponse(res, 429, `Please wait ${cooldownRemaining(user.lastOtpSentAt)} seconds before requesting another OTP.`);
    }

    const otp    = generateOtp();
    const hashed = await hashOtp(otp);

    user.resetOtp          = hashed;
    user.resetOtpExpire    = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtpAttempts  = 0;
    user.resetOtpVerified  = false;
    user.lastOtpSentAt     = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetOtpEmail({ to: email, name: user.name, otp });
    } catch (emailErr) {
      console.error("Reset OTP email error:", emailErr.message);
      return errorResponse(res, 500, "Could not send OTP email. Try again.");
    }

    return successResponse(res, 200, "OTP sent to your email. Valid for 10 minutes.");
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── FORGOT PASSWORD — VERIFY OTP ─────────────────────────────────────────
// POST /api/auth/verify-reset-otp
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, "Email and OTP are required");

    const user = await User.findOne({ email }).select(
      "+resetOtp +resetOtpExpire +resetOtpAttempts +resetOtpVerified"
    );

    if (!user) return errorResponse(res, 400, "Invalid OTP");

    if (user.resetOtpAttempts >= 5) {
      user.resetOtp         = undefined;
      user.resetOtpExpire   = undefined;
      user.resetOtpAttempts = 0;
      user.resetOtpVerified = false;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 429, "Too many failed attempts. Please request a new OTP.");
    }

    if (!user.resetOtp || !user.resetOtpExpire)
      return errorResponse(res, 400, "No OTP found. Please request a new one.");

    if (new Date() > user.resetOtpExpire) {
      user.resetOtp         = undefined;
      user.resetOtpExpire   = undefined;
      user.resetOtpAttempts = 0;
      user.resetOtpVerified = false;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 400, "OTP has expired. Please request a new one.");
    }

    const isValid = await compareOtp(otp.toString(), user.resetOtp);
    if (!isValid) {
      user.resetOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 401, `Invalid OTP. ${5 - user.resetOtpAttempts} attempts remaining.`);
    }

    // OTP verified — allow password reset, but don't clear OTP yet (need email in next step)
    user.resetOtpVerified  = true;
    user.resetOtpAttempts  = 0;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "OTP verified. You can now set a new password.");
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── FORGOT PASSWORD — RESET PASSWORD ─────────────────────────────────────
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword)
      return errorResponse(res, 400, "Email, new password and confirm password are required");

    if (newPassword !== confirmPassword)
      return errorResponse(res, 400, "Passwords do not match");

    if (newPassword.length < 6)
      return errorResponse(res, 400, "Password must be at least 6 characters");

    const user = await User.findOne({ email }).select(
      "+resetOtp +resetOtpExpire +resetOtpVerified"
    );

    if (!user) return errorResponse(res, 400, "Invalid request");

    if (!user.resetOtpVerified)
      return errorResponse(res, 403, "Please verify your OTP first before resetting password.");

    if (!user.resetOtpExpire || new Date() > user.resetOtpExpire)
      return errorResponse(res, 400, "Session expired. Please start again.");

    // Set new password and clear all reset OTP data
    user.password         = newPassword;
    user.resetOtp         = undefined;
    user.resetOtpExpire   = undefined;
    user.resetOtpAttempts = 0;
    user.resetOtpVerified = false;
    await user.save();

    return successResponse(res, 200, "Password reset successfully. Please log in with your new password.");
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse(res, 500, error.message);
  }
};

// ─── GET CURRENT USER ──────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, "User not found");

    return successResponse(res, 200, "User fetched successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── CHANGE PASSWORD ───────────────────────────────────────────────────────
// PUT /api/auth/change-password  (protected)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return errorResponse(res, 400, "Current and new password are required");

    if (newPassword.length < 6)
      return errorResponse(res, 400, "New password must be at least 6 characters");

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) return errorResponse(res, 400, "Current password is incorrect");

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, "Password changed successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  register,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  sendVerifyOtp,
  verifyEmailOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getMe,
  changePassword,
};
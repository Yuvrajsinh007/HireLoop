const User = require("../models/User");
const Student = require("../models/Student");
const { generateToken, generateShortToken, verifyToken } = require("../utils/generateToken");
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/sendEmail");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── REGISTER ──────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 400, "Name, email and password are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email already registered");
    }

    // Only allow valid roles on register (no direct admin creation)
    const allowedRoles = ["student", "senior"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    // Create user
    const user = await User.create({ name, email, password, role: userRole });

    // If student role → create student profile
    if (userRole === "student" || userRole === "senior") {
      await Student.create({ user: user._id });
    }

    // Generate email verification token
    const verifyToken_ = generateShortToken(user._id, "verify");
    const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken_}`;

    // Send emails (don't block registration if email fails)
    try {
      await sendVerificationEmail({ to: email, name, verifyURL });
      await sendWelcomeEmail({ to: email, name });
    } catch (emailErr) {
      console.error("Email send error during register:", emailErr.message);
    }

    // Generate access token
    const token = generateToken(user._id, user.role);

    return successResponse(res, 201, "Registration successful! Please verify your email.", {
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
    return errorResponse(res, 500, error.message);
  }
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse(res, 401, "Your account has been deactivated. Contact admin.");
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    // Update last login
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
    return errorResponse(res, 500, error.message);
  }
};

// ─── VERIFY EMAIL ──────────────────────────────────────────────────────────
// GET /api/auth/verify-email?token=xxx
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return errorResponse(res, 400, "Verification token is required");
    }

    const decoded = verifyToken(token);

    if (decoded.purpose !== "verify") {
      return errorResponse(res, 400, "Invalid token purpose");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (user.isEmailVerified) {
      return successResponse(res, 200, "Email already verified");
    }

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "Email verified successfully! You can now log in.");
  } catch (error) {
    return errorResponse(res, 400, "Invalid or expired verification link");
  }
};

// ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(res, 200, "If this email exists, a reset link has been sent.");
    }

    const resetToken = generateShortToken(user._id, "reset");
    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({ to: email, name: user.name, resetURL });
    } catch (emailErr) {
      console.error("Reset email error:", emailErr.message);
      return errorResponse(res, 500, "Could not send reset email. Try again.");
    }

    return successResponse(res, 200, "Password reset link sent to your email.");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── RESET PASSWORD ────────────────────────────────────────────────────────
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse(res, 400, "Token and new password are required");
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, "Password must be at least 6 characters");
    }

    const decoded = verifyToken(token);

    if (decoded.purpose !== "reset") {
      return errorResponse(res, 400, "Invalid token purpose");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    return successResponse(res, 200, "Password reset successful. You can now log in.");
  } catch (error) {
    return errorResponse(res, 400, "Invalid or expired reset link");
  }
};

// ─── GET CURRENT USER ──────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

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

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, "Current and new password are required");
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, "New password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return errorResponse(res, 400, "Current password is incorrect");
    }

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
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
};
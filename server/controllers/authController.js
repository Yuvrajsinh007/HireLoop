const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User              = require("../models/User");
const MemberProfile     = require("../models/MemberProfile");
const Institution       = require("../models/Institution");
const InstitutionDomain = require("../models/InstitutionDomain");
const { generateToken } = require("../utils/generateToken");
const {
  sendWelcomeEmail,
  sendVerificationOtpEmail,
  sendLoginOtpEmail,
  sendPasswordResetOtpEmail,
} = require("../utils/sendEmail");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── HELPERS ──────────────────────────────────────────────────────────────
const generateOtp     = () => crypto.randomInt(100000, 999999).toString();
const hashOtp         = async (otp) => bcrypt.hash(otp, 10);
const compareOtp      = async (otp, hash) => bcrypt.compare(otp, hash);
const isOnCooldown    = (last) => last && (Date.now() - new Date(last).getTime()) / 1000 < 60;
const cooldownLeft    = (last) => Math.max(0, Math.ceil(60 - (Date.now() - new Date(last).getTime()) / 1000));

/** Extract domain from email, e.g. "foo@bar.edu.in" → "bar.edu.in" */
const getDomain = (email) => email.split("@")[1]?.toLowerCase().trim();

/** Build safe user payload for JWT response */
const buildUserPayload = (user) => ({
  _id:             user._id,
  name:            user.name,
  email:           user.email,
  role:            user.role,
  institution:     user.institution,
  academicStatus:  user.academicStatus,
  placementStatus: user.placementStatus,
  employmentStatus:user.employmentStatus,
  isEmailVerified: user.isEmailVerified,
  avatar:          user.avatar,
});

// ─── REGISTER ──────────────────────────────────────────────────────────────
// POST /api/auth/register
// Members (students/alumni) register with their institutional email
// The institution is auto-detected from the email domain
const register = async (req, res) => {
  try {
    const { name, email, password, registrationIntent } = req.body;
    // registrationIntent: "student" | "alumni"

    if (!name || !email || !password)
      return errorResponse(res, 400, "Name, email, and password are required");

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return errorResponse(res, 400, "Email already registered");

    const domain = getDomain(email);
    if (!domain)
      return errorResponse(res, 400, "Invalid email address");

    // ── Auto-detect institution from email domain ──────────────────────────
    const domainRecord = await InstitutionDomain.findOne({ domain }).populate("institution");

    if (!domainRecord) {
      return errorResponse(
        res,
        400,
        "Your college is not registered on this platform. Please contact your placement office."
      );
    }

    if (!domainRecord.institution || domainRecord.institution.status !== "active") {
      return errorResponse(
        res,
        403,
        "Your institution is not currently active on this platform."
      );
    }

    const institution = domainRecord.institution;
    const intent      = registrationIntent === "alumni" ? "alumni" : "student";

    // Check if this domain allows this type of user
    if (!domainRecord.allowedFor.includes(intent === "alumni" ? "alumni" : "student")) {
      return errorResponse(
        res,
        400,
        `This email domain does not support ${intent} registration.`
      );
    }

    // ── Create user ────────────────────────────────────────────────────────
    const academicStatus = intent === "alumni" ? "GRADUATED" : "ENROLLED";
    const employmentStatus = intent === "alumni" ? "WORKING" : "STUDENT";
    const placementStatus  = intent === "alumni" ? "NOT_APPLICABLE" : "UNPLACED";

    const user = await User.create({
      name,
      email,
      password,
      role:            "member",
      institution:     institution._id,
      academicStatus,
      placementStatus,
      employmentStatus,
    });

    // ── Create MemberProfile ──────────────────────────────────────────────
    await MemberProfile.create({
      user:        user._id,
      institution: institution._id,
    });

    // ── Send welcome email ─────────────────────────────────────────────────
    try {
      await sendWelcomeEmail({ to: email, name });
    } catch (e) {
      console.error("Welcome email error (ignored):", e.message);
    }

    const token = generateToken(user._id, user.role);

    return successResponse(res, 201, "Registration successful! Welcome to HireLoop.", {
      token,
      user: buildUserPayload(user),
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

    const user = await User.findOne({ email })
      .select("+password")
      .populate("institution", "_id name status");

    if (!user)
      return errorResponse(res, 401, "Invalid email or password");

    if (!user.isActive)
      return errorResponse(res, 401, "Your account has been deactivated. Contact admin.");

    if (user.role !== "superAdmin" && user.institution?.status !== "active") {
      return errorResponse(res, 403, "Your institution is not active on this platform.");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return errorResponse(res, 401, "Invalid email or password");

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, "Login successful", {
      token,
      user: buildUserPayload(user),
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

    const user = await User.findOne({ email })
      .select("+lastOtpSentAt +loginOtp +loginOtpExpire +loginOtpAttempts")
      .populate("institution", "status");

    if (!user)
      return successResponse(res, 200, "If this email is registered, an OTP has been sent.");

    if (!user.isActive)
      return errorResponse(res, 401, "Your account has been deactivated.");

    if (user.role !== "superAdmin" && user.institution?.status !== "active")
      return errorResponse(res, 403, "Your institution is not active.");

    if (isOnCooldown(user.lastOtpSentAt))
      return errorResponse(res, 429, `Please wait ${cooldownLeft(user.lastOtpSentAt)} seconds before requesting another OTP.`);

    const otp    = generateOtp();
    const hashed = await hashOtp(otp);

    user.loginOtp         = hashed;
    user.loginOtpExpire   = new Date(Date.now() + 10 * 60 * 1000);
    user.loginOtpAttempts = 0;
    user.lastOtpSentAt    = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await sendLoginOtpEmail({ to: email, name: user.name, otp });
    } catch (e) {
      console.error("Login OTP email error:", e.message);
      return errorResponse(res, 500, "Could not send OTP email. Try again.");
    }

    return successResponse(res, 200, "OTP sent to your email. Valid for 10 minutes.");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── VERIFY LOGIN OTP ──────────────────────────────────────────────────────
// POST /api/auth/verify-login-otp
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, "Email and OTP are required");

    const user = await User.findOne({ email })
      .select("+loginOtp +loginOtpExpire +loginOtpAttempts +isActive")
      .populate("institution", "_id name status");

    if (!user) return errorResponse(res, 401, "Invalid OTP");
    if (!user.isActive) return errorResponse(res, 401, "Account deactivated.");

    if (user.loginOtpAttempts >= 5) {
      user.loginOtp = user.loginOtpExpire = undefined;
      user.loginOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 429, "Too many failed attempts. Please request a new OTP.");
    }

    if (!user.loginOtp || !user.loginOtpExpire)
      return errorResponse(res, 400, "No OTP found. Please request a new one.");

    if (new Date() > user.loginOtpExpire) {
      user.loginOtp = user.loginOtpExpire = undefined;
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

    user.loginOtp = user.loginOtpExpire = undefined;
    user.loginOtpAttempts = 0;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, "Login successful", {
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── SEND EMAIL VERIFY OTP ─────────────────────────────────────────────────
// POST /api/auth/send-verify-otp  (protected)
const sendVerifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("+emailVerifyOtp +emailVerifyOtpExpire +emailVerifyOtpAttempts +lastOtpSentAt");

    if (!user) return errorResponse(res, 404, "User not found");
    if (user.isEmailVerified) return errorResponse(res, 400, "Email is already verified.");

    if (isOnCooldown(user.lastOtpSentAt))
      return errorResponse(res, 429, `Please wait ${cooldownLeft(user.lastOtpSentAt)} seconds before requesting another OTP.`);

    const otp    = generateOtp();
    const hashed = await hashOtp(otp);

    user.emailVerifyOtp         = hashed;
    user.emailVerifyOtpExpire   = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerifyOtpAttempts = 0;
    user.lastOtpSentAt          = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationOtpEmail({ to: user.email, name: user.name, otp });
    } catch (e) {
      console.error("Verify OTP email error:", e.message);
      return errorResponse(res, 500, "Could not send OTP email. Try again.");
    }

    return successResponse(res, 200, "OTP sent to your email. Valid for 10 minutes.");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── VERIFY EMAIL OTP ──────────────────────────────────────────────────────
// POST /api/auth/verify-email-otp  (protected)
const verifyEmailOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return errorResponse(res, 400, "OTP is required");

    const user = await User.findById(req.user._id)
      .select("+emailVerifyOtp +emailVerifyOtpExpire +emailVerifyOtpAttempts");

    if (!user) return errorResponse(res, 404, "User not found");
    if (user.isEmailVerified) return errorResponse(res, 400, "Email already verified.");

    if (user.emailVerifyOtpAttempts >= 5) {
      user.emailVerifyOtp = user.emailVerifyOtpExpire = undefined;
      user.emailVerifyOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 429, "Too many failed attempts. Please request a new OTP.");
    }

    if (!user.emailVerifyOtp || !user.emailVerifyOtpExpire)
      return errorResponse(res, 400, "No OTP found. Please request a new one.");

    if (new Date() > user.emailVerifyOtpExpire) {
      user.emailVerifyOtp = user.emailVerifyOtpExpire = undefined;
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

    user.isEmailVerified        = true;
    user.emailVerifyOtp         = undefined;
    user.emailVerifyOtpExpire   = undefined;
    user.emailVerifyOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "Email verified successfully! ✅", { isEmailVerified: true });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");

    const user = await User.findOne({ email })
      .select("+lastOtpSentAt +resetOtp +resetOtpExpire");

    if (!user)
      return successResponse(res, 200, "If this email is registered, an OTP has been sent.");

    if (isOnCooldown(user.lastOtpSentAt))
      return errorResponse(res, 429, `Please wait ${cooldownLeft(user.lastOtpSentAt)} seconds.`);

    const otp    = generateOtp();
    const hashed = await hashOtp(otp);

    user.resetOtp         = hashed;
    user.resetOtpExpire   = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtpAttempts = 0;
    user.resetOtpVerified = false;
    user.lastOtpSentAt    = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetOtpEmail({ to: email, name: user.name, otp });
    } catch (e) {
      console.error("Reset OTP email error:", e.message);
      return errorResponse(res, 500, "Could not send OTP email. Try again.");
    }

    return successResponse(res, 200, "OTP sent to your email. Valid for 10 minutes.");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── VERIFY RESET OTP ──────────────────────────────────────────────────────
// POST /api/auth/verify-reset-otp
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, "Email and OTP are required");

    const user = await User.findOne({ email })
      .select("+resetOtp +resetOtpExpire +resetOtpAttempts +resetOtpVerified");

    if (!user) return errorResponse(res, 400, "Invalid OTP");

    if (user.resetOtpAttempts >= 5) {
      user.resetOtp = user.resetOtpExpire = undefined;
      user.resetOtpAttempts = 0;
      user.resetOtpVerified = false;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 429, "Too many failed attempts. Please request a new OTP.");
    }

    if (!user.resetOtp || !user.resetOtpExpire)
      return errorResponse(res, 400, "No OTP found. Please request a new one.");

    if (new Date() > user.resetOtpExpire) {
      user.resetOtp = user.resetOtpExpire = undefined;
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

    user.resetOtpVerified = true;
    user.resetOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "OTP verified. You can now set a new password.");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── RESET PASSWORD ────────────────────────────────────────────────────────
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword)
      return errorResponse(res, 400, "Email, new password, and confirm password are required");

    if (newPassword !== confirmPassword)
      return errorResponse(res, 400, "Passwords do not match");

    if (newPassword.length < 6)
      return errorResponse(res, 400, "Password must be at least 6 characters");

    const user = await User.findOne({ email })
      .select("+resetOtp +resetOtpExpire +resetOtpVerified");

    if (!user) return errorResponse(res, 400, "Invalid request");

    if (!user.resetOtpVerified)
      return errorResponse(res, 403, "Please verify your OTP first before resetting password.");

    if (!user.resetOtpExpire || new Date() > user.resetOtpExpire)
      return errorResponse(res, 400, "Session expired. Please start again.");

    user.password         = newPassword;
    user.resetOtp         = undefined;
    user.resetOtpExpire   = undefined;
    user.resetOtpAttempts = 0;
    user.resetOtpVerified = false;
    await user.save();

    return successResponse(res, 200, "Password reset successfully. Please log in with your new password.");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ─── GET CURRENT USER ──────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("institution", "_id name shortName status logo");

    if (!user) return errorResponse(res, 404, "User not found");

    return successResponse(res, 200, "User fetched successfully", buildUserPayload(user));
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
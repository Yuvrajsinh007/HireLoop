const User              = require("../models/User");
const MemberProfile     = require("../models/MemberProfile");
const InstitutionDomain = require("../models/InstitutionDomain");
const PendingRegistration = require("../models/PendingRegistration");
const { generateToken } = require("../utils/generateToken");
const {
  sendWelcomeEmail,
  sendVerificationOtpEmail,
  sendLoginOtpEmail,
  sendPasswordResetOtpEmail,
} = require("../utils/sendEmail");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const {
  generateOtp,
  hashOtp,
  compareOtp,
  isOnCooldown,
  cooldownLeft,
  getDomain,
} = require("../utils/otp");
const { writeAudit } = require("../utils/audit");

const buildUserPayload = (user) => ({
  _id:              user._id,
  name:             user.name,
  email:            user.email,
  phone:            user.phone,
  role:             user.role,
  institution:      user.institution,
  academicStatus:   user.academicStatus,
  placementStatus:  user.placementStatus,
  employmentStatus: user.employmentStatus,
  isEmailVerified:  user.isEmailVerified,
  avatar:           user.avatar,
});

const findActiveDomain = async (email) => {
  const domain = getDomain(email);
  if (!domain) return { error: "Invalid email address" };

  const domainRecord = await InstitutionDomain.findOne({
    domain,
    isActive: { $ne: false },
  }).populate("institution");

  if (!domainRecord) {
    return {
      error:
        "Your college is not currently registered on HireLoop. Please contact your placement office.",
    };
  }

  if (!domainRecord.institution || domainRecord.institution.status !== "active") {
    return { error: "Your institution is not currently active on this platform." };
  }

  if (
    domainRecord.allowedFor?.length &&
    !domainRecord.allowedFor.includes("student")
  ) {
    return { error: "This email domain does not support student registration." };
  }

  return { domainRecord, domain };
};

const startRegistration = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");

    const normalized = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalized });
    if (existingUser) return errorResponse(res, 400, "Email already registered");

    const lookup = await findActiveDomain(normalized);
    if (lookup.error) return errorResponse(res, 400, lookup.error);

    let pending = await PendingRegistration.findOne({ email: normalized }).select(
      "+otpHash +otpExpire +otpAttempts +lastOtpSentAt"
    );

    if (pending && isOnCooldown(pending.lastOtpSentAt)) {
      return errorResponse(
        res,
        429,
        `Please wait ${cooldownLeft(pending.lastOtpSentAt)} seconds before requesting another OTP.`
      );
    }

    const otp = generateOtp();
    const hashed = await hashOtp(otp);

    if (!pending) {
      pending = new PendingRegistration({
        email: normalized,
        institution: lookup.domainRecord.institution._id,
      });
    }

    pending.institution = lookup.domainRecord.institution._id;
    pending.otpHash = hashed;
    pending.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    pending.otpAttempts = 0;
    pending.lastOtpSentAt = new Date();
    pending.verified = false;
    await pending.save();

    try {
      await sendVerificationOtpEmail({ to: normalized, name: "Student", otp });
    } catch (e) {
      console.error("Registration OTP email error:", e.message);
      return errorResponse(res, 500, "Could not send OTP email. Try again.");
    }

    return successResponse(res, 200, "OTP sent to your college email. Valid for 10 minutes.", {
      email: normalized,
      institution: {
        _id: lookup.domainRecord.institution._id,
        name: lookup.domainRecord.institution.name,
        shortName: lookup.domainRecord.institution.shortName,
        logo: lookup.domainRecord.institution.logo,
      },
      domain: lookup.domain,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, "Email and OTP are required");

    const pending = await PendingRegistration.findOne({
      email: email.trim().toLowerCase(),
    }).select("+otpHash +otpExpire +otpAttempts");

    if (!pending) return errorResponse(res, 400, "No OTP found. Please request a new one.");

    if (pending.otpAttempts >= 5) {
      pending.otpHash = undefined;
      pending.otpExpire = undefined;
      pending.otpAttempts = 0;
      pending.verified = false;
      await pending.save();
      return errorResponse(res, 429, "Too many failed attempts. Please request a new OTP.");
    }

    if (!pending.otpHash || !pending.otpExpire)
      return errorResponse(res, 400, "No OTP found. Please request a new one.");

    if (new Date() > pending.otpExpire) {
      pending.verified = false;
      await pending.save();
      return errorResponse(res, 400, "OTP has expired. Please request a new one.");
    }

    const isValid = await compareOtp(otp.toString(), pending.otpHash);
    if (!isValid) {
      pending.otpAttempts += 1;
      await pending.save();
      return errorResponse(
        res,
        401,
        `Invalid OTP. ${5 - pending.otpAttempts} attempts remaining.`
      );
    }

    pending.verified = true;
    pending.otpAttempts = 0;
    pending.otpHash = undefined;
    pending.otpExpire = undefined;
    await pending.save();

    return successResponse(res, 200, "Email verified. Continue with your details.");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const completeRegistration = async (req, res) => {
  try {
    const {
      email,
      name,
      password,
      phone,
      dateOfBirth,
      rollNumber,
      academicUnit,
      program,
      enrollmentYear,
      graduationYear,
      cgpa,
      activeBacklogs,
    } = req.body;

    if (!name || !email || !password)
      return errorResponse(res, 400, "Name, email, and password are required");

    if (password.length < 6)
      return errorResponse(res, 400, "Password must be at least 6 characters");

    const normalized = email.trim().toLowerCase();
    const pending = await PendingRegistration.findOne({ email: normalized });
    if (!pending || !pending.verified)
      return errorResponse(res, 403, "Please verify your college email OTP first.");

    const existingUser = await User.findOne({ email: normalized });
    if (existingUser) return errorResponse(res, 400, "Email already registered");

    const lookup = await findActiveDomain(normalized);
    if (lookup.error) return errorResponse(res, 400, lookup.error);

    const institution = lookup.domainRecord.institution;

    const user = await User.create({
      name,
      email: normalized,
      password,
      phone: phone || "",
      dateOfBirth: dateOfBirth || null,
      role: "member",
      institution: institution._id,
      academicStatus: "ENROLLED",
      placementStatus: "UNPLACED",
      employmentStatus: "STUDENT",
      isEmailVerified: true,
    });

    await MemberProfile.create({
      user: user._id,
      institution: institution._id,
      phone: phone || "",
      dateOfBirth: dateOfBirth || null,
      rollNumber: rollNumber || "",
      academicUnit: academicUnit || null,
      program: program || null,
      enrollmentYear: enrollmentYear || null,
      graduationYear: graduationYear || null,
      cgpa: cgpa ?? null,
      activeBacklogs: activeBacklogs ?? 0,
    });

    await PendingRegistration.deleteOne({ _id: pending._id });

    try {
      await sendWelcomeEmail({ to: normalized, name });
    } catch (e) {
      console.error("Welcome email error (ignored):", e.message);
    }

    await writeAudit(req, {
      action: "student_registered",
      entity: "User",
      entityId: user._id,
    });

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

const register = completeRegistration;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return errorResponse(res, 400, "Email and password are required");

    const user = await User.findOne({ email })
      .select("+password")
      .populate("institution", "_id name status");

    if (!user) return errorResponse(res, 401, "Invalid email or password");
    if (!user.isActive)
      return errorResponse(res, 401, "Your account has been deactivated. Contact admin.");

    if (user.role !== "superAdmin" && user.institution?.status !== "active") {
      return errorResponse(res, 403, "Your institution is not active on this platform.");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return errorResponse(res, 401, "Invalid email or password");

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
      return errorResponse(
        res,
        429,
        `Please wait ${cooldownLeft(user.lastOtpSentAt)} seconds before requesting another OTP.`
      );

    const otp = generateOtp();
    const hashed = await hashOtp(otp);

    user.loginOtp = hashed;
    user.loginOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.loginOtpAttempts = 0;
    user.lastOtpSentAt = new Date();
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
      return errorResponse(
        res,
        401,
        `Invalid OTP. ${5 - user.loginOtpAttempts} attempts remaining.`
      );
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

const sendVerifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "+emailVerifyOtp +emailVerifyOtpExpire +emailVerifyOtpAttempts +lastOtpSentAt"
    );

    if (!user) return errorResponse(res, 404, "User not found");
    if (user.isEmailVerified) return errorResponse(res, 400, "Email is already verified.");

    if (isOnCooldown(user.lastOtpSentAt))
      return errorResponse(
        res,
        429,
        `Please wait ${cooldownLeft(user.lastOtpSentAt)} seconds before requesting another OTP.`
      );

    const otp = generateOtp();
    const hashed = await hashOtp(otp);

    user.emailVerifyOtp = hashed;
    user.emailVerifyOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerifyOtpAttempts = 0;
    user.lastOtpSentAt = new Date();
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
      return errorResponse(
        res,
        401,
        `Invalid OTP. ${5 - user.emailVerifyOtpAttempts} attempts remaining.`
      );
    }

    user.isEmailVerified = true;
    user.emailVerifyOtp = undefined;
    user.emailVerifyOtpExpire = undefined;
    user.emailVerifyOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "Email verified successfully.", { isEmailVerified: true });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");

    const user = await User.findOne({ email }).select("+lastOtpSentAt +resetOtp +resetOtpExpire");

    if (!user)
      return successResponse(res, 200, "If this email is registered, an OTP has been sent.");

    if (isOnCooldown(user.lastOtpSentAt))
      return errorResponse(res, 429, `Please wait ${cooldownLeft(user.lastOtpSentAt)} seconds.`);

    const otp = generateOtp();
    const hashed = await hashOtp(otp);

    user.resetOtp = hashed;
    user.resetOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtpAttempts = 0;
    user.resetOtpVerified = false;
    user.lastOtpSentAt = new Date();
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

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, "Email and OTP are required");

    const user = await User.findOne({ email }).select(
      "+resetOtp +resetOtpExpire +resetOtpAttempts +resetOtpVerified"
    );

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
      return errorResponse(
        res,
        401,
        `Invalid OTP. ${5 - user.resetOtpAttempts} attempts remaining.`
      );
    }

    user.resetOtpVerified = true;
    user.resetOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, "OTP verified. You can now set a new password.");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword)
      return errorResponse(res, 400, "Email, new password, and confirm password are required");

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

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    user.resetOtpAttempts = 0;
    user.resetOtpVerified = false;
    await user.save();

    return successResponse(
      res,
      200,
      "Password reset successfully. Please log in with your new password."
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "institution",
      "_id name shortName status logo"
    );

    if (!user) return errorResponse(res, 404, "User not found");

    return successResponse(res, 200, "User fetched successfully", buildUserPayload(user));
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

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
  startRegistration,
  verifyRegistrationOtp,
  completeRegistration,
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

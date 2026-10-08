const express = require("express");
const router  = express.Router();
const {
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
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { rateLimit } = require("../middleware/rateLimitMiddleware");

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.use(authLimiter);

// ─── Public Routes ─────────────────────────────────────────────────────────
router.post("/register/start",      startRegistration);
router.post("/register/verify-otp", verifyRegistrationOtp);
router.post("/register/complete",   completeRegistration);
router.post("/register",            register);
router.post("/login",               login);
router.post("/send-login-otp",      sendLoginOtp);
router.post("/verify-login-otp",    verifyLoginOtp);
router.post("/forgot-password",     forgotPassword);
router.post("/verify-reset-otp",    verifyResetOtp);
router.post("/reset-password",      resetPassword);

// ─── Protected Routes ──────────────────────────────────────────────────────
router.get("/me",                 protect, getMe);
router.put("/change-password",    protect, changePassword);
router.post("/send-verify-otp",   protect, sendVerifyOtp);
router.post("/verify-email-otp",  protect, verifyEmailOtp);

module.exports = router;
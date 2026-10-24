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

// ─── Public Routes (Rate Limited to prevent spam/brute force) ──────────────
router.post("/register/start",      authLimiter, startRegistration);
router.post("/register/verify-otp", authLimiter, verifyRegistrationOtp);
router.post("/register/complete",   authLimiter, completeRegistration);
router.post("/register",            authLimiter, register); // Alias for complete
router.post("/login",               authLimiter, login);
router.post("/send-login-otp",      authLimiter, sendLoginOtp);
router.post("/verify-login-otp",    authLimiter, verifyLoginOtp);
router.post("/forgot-password",     authLimiter, forgotPassword);
router.post("/verify-reset-otp",    authLimiter, verifyResetOtp);
router.post("/reset-password",      authLimiter, resetPassword);

// ─── Protected Routes (NO rate limit to prevent dashboard lockouts) ────────
router.get("/me",                 protect, getMe);
router.put("/change-password",    protect, changePassword);
router.post("/send-verify-otp",   protect, sendVerifyOtp);
router.post("/verify-email-otp",  protect, verifyEmailOtp);

module.exports = router;
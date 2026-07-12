import API from "./api";

// ─── Registration & Password Login ────────────────────────────────────────
export const registerUser   = (data)  => API.post("/auth/register", data);
export const loginUser      = (data)  => API.post("/auth/login", data);
export const getMe          = ()      => API.get("/auth/me");
export const changePassword = (data)  => API.put("/auth/change-password", data);

// ─── OTP Login ────────────────────────────────────────────────────────────
export const sendLoginOtp   = (email) => API.post("/auth/send-login-otp", { email });
export const verifyLoginOtp = (email, otp) => API.post("/auth/verify-login-otp", { email, otp });

// ─── Email Verification OTP (protected — requires JWT) ───────────────────
export const sendVerifyOtp  = ()      => API.post("/auth/send-verify-otp");
export const verifyEmailOtp = (otp)   => API.post("/auth/verify-email-otp", { otp });

// ─── Forgot Password OTP Flow ─────────────────────────────────────────────
export const forgotPassword  = (email)                   => API.post("/auth/forgot-password", { email });
export const verifyResetOtp  = (email, otp)              => API.post("/auth/verify-reset-otp", { email, otp });
export const resetPassword   = (email, newPassword, confirmPassword) =>
  API.post("/auth/reset-password", { email, newPassword, confirmPassword });
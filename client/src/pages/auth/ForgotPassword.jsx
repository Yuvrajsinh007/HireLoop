import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword, verifyResetOtp, resetPassword } from "../../services/authService";
import OtpInput from "../../components/common/OtpInput";
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

const COOLDOWN = 60;

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]       = useState(1); // 1=email, 2=otp, 3=newpassword, 4=success
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(COOLDOWN);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    try {
      setLoading(true);
      await forgotPassword(email);
      setStep(2);
      setOtp("");
      toast.success("OTP sent to your email!");
      startCooldown();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Please enter the 6-digit OTP");
    try {
      setLoading(true);
      await verifyResetOtp(email, otp);
      setStep(3);
      toast.success("OTP verified! Set your new password.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    try {
      setLoading(true);
      await resetPassword(email, newPassword, confirmPassword);
      setStep(4);
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await forgotPassword(email);
      setOtp("");
      toast.success("New OTP sent!");
      startCooldown();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Enter Email", "Verify OTP", "New Password"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">HireLoop</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-500 mt-2 text-sm">We'll send an OTP to verify it's you</p>
        </div>

        {/* Step indicator (only steps 1-3) */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-6 px-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? "text-indigo-600" : "text-gray-400"}`}>{s}</span>
                {i < 2 && <div className={`w-8 h-px ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── Step 1: Enter Email ── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-500">Enter your registered email address and we'll send you a 6-digit OTP.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="College Email"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Remember your password?{" "}
                <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">Sign in</Link>
              </p>
            </form>
          )}

          {/* ── Step 2: Verify OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-2">
                <p className="text-sm font-semibold text-gray-800">Check your inbox</p>
                <p className="text-xs text-gray-500 mt-1">
                  OTP sent to <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter 6-digit OTP
                </label>
                <OtpInput value={otp} onChange={setOtp} disabled={loading} />
              </div>

              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify OTP"}
              </button>

              <div className="text-center space-y-1">
                {cooldown > 0 ? (
                  <p className="text-xs text-gray-400">Resend in <span className="font-semibold text-gray-600">{cooldown}s</span></p>
                ) : (
                  <button type="button" onClick={handleResendOtp} disabled={loading}
                    className="text-xs text-indigo-600 font-medium hover:underline">
                    Resend OTP
                  </button>
                )}
                <button type="button" onClick={() => { setStep(1); setOtp(""); }}
                  className="block w-full text-xs text-gray-400 hover:text-gray-600">
                  ← Change email
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-500">OTP verified! Create your new password.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-10"
                    placeholder="Min. 6 characters"
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <input
                  type={showPw ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Re-enter password"
                />
              </div>

              {/* Password match indicator */}
              {confirmPassword && (
                <p className={`text-xs font-medium ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                  {newPassword === confirmPassword ? "✅ Passwords match" : "❌ Passwords do not match"}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
              </button>
            </form>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset!</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Your password has been changed successfully.<br />Please log in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
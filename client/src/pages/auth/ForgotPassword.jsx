import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { forgotPassword, verifyResetOtp, resetPassword } from "../../services/authService";
import OtpInput from "../../components/common/OtpInput";
import Navbar from "../../components/common/Navbar";
import {
  ArrowLeft, Loader2, Eye, EyeOff, CheckCircle, CheckCircle2, XCircle,
  Mail, Lock, KeyRound, ArrowRight, Sparkles,
} from "lucide-react";

const COOLDOWN = 60;

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]       = useState(1); // 1=email, 2=otp, 3=newpassword, 4=success
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 mb-5">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">We'll send an OTP to verify it's you</p>
          </div>

          {/* Step indicator (only steps 1-3) */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-6 px-4">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm
                    ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-indigo-600 text-white scale-110" : "bg-gray-100 text-gray-400"}`}>
                    {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${step === i + 1 ? "text-indigo-600" : "text-gray-400"}`}>{s}</span>
                  {i < 2 && <div className={`w-8 h-0.5 rounded-full transition-colors ${step > i + 1 ? "bg-emerald-400" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {/* ── Step 1: Enter Email ── */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <p className="text-sm text-gray-500 font-medium">Enter your registered email address and we'll send you a 6-digit OTP.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                        placeholder="College Email"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Remember your password?{" "}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign in</Link>
                  </p>
                </motion.form>
              )}

              {/* ── Step 2: Verify OTP ── */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <p className="text-sm font-bold text-gray-800">Check your inbox</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      OTP sent to <span className="font-semibold text-gray-700">{email}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                      Enter 6-digit OTP
                    </label>
                    <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                  </div>

                  <button type="submit" disabled={loading || otp.length !== 6}
                    className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify OTP <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <div className="text-center space-y-1.5">
                    {cooldown > 0 ? (
                      <p className="text-xs text-gray-400 font-medium">Resend in <span className="font-bold text-gray-600">{cooldown}s</span></p>
                    ) : (
                      <button type="button" onClick={handleResendOtp} disabled={loading}
                        className="text-xs text-indigo-600 font-semibold hover:underline">
                        Resend OTP
                      </button>
                    )}
                    <button type="button" onClick={() => { setStep(1); setOtp(""); }}
                      className="flex items-center justify-center gap-1 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
                      <ArrowLeft className="w-3 h-3" /> Change email
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ── Step 3: New Password ── */}
              {step === 3 && (
                <motion.form
                  key="step3"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <p className="text-sm text-gray-500 font-medium">OTP verified! Create your new password.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? "text" : "password"} value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                        placeholder="Min. 6 characters"
                      />
                      <button type="button" onClick={() => setShowNewPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                        placeholder="Re-enter password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password match indicator */}
                  {confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`text-xs font-semibold flex items-center gap-1 ${newPassword === confirmPassword ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {newPassword === confirmPassword
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                        : <><XCircle className="w-3.5 h-3.5" /> Passwords do not match</>}
                    </motion.p>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <Sparkles className="w-4 h-4" /></>}
                  </button>
                </motion.form>
              )}

              {/* ── Step 4: Success ── */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset!</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                    Your password has been changed successfully.<br />Please log in with your new password.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20"
                  >
                    <ArrowLeft className="w-4 h-4" /> Go to Login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
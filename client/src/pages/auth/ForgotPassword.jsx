import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../../services/authService";
import OtpInput from "../../components/common/OtpInput";

const COOLDOWN = 60;

const STEPS = ["Email", "Verify", "Reset"];

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(COOLDOWN);

    const interval = setInterval(() => {
      setCooldown((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();

    if (!email) {
      toast.error("Enter your registered email address.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email);

      setStep(2);
      setOtp("");
      startCooldown();

      toast.success("A verification code was sent to your email.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "We could not send a verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      toast.error("Enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      await verifyResetOtp(email, otp);

      setStep(3);
      toast.success("Email verified. Create your new password.");
    } catch (err) {
      setOtp("");

      toast.error(
        err?.response?.data?.message ||
          "That verification code is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email, newPassword, confirmPassword);

      setStep(4);
      toast.success("Your password has been reset.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Password reset could not be completed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);

      await forgotPassword(email);

      setOtp("");
      startCooldown();

      toast.success("A new verification code was sent.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "We could not resend the verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = () => {
    setStep(1);
    setOtp("");
  };

  const formVariants = {
    hidden: { opacity: 0, x: 16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.22 },
    },
    exit: {
      opacity: 0,
      x: -16,
      transition: { duration: 0.16 },
    },
  };

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/15">
            <KeyRound className="h-6 w-6 text-violet-400" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
            Account recovery
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Reset your password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Verify your email, then choose a new secure password.
          </p>
        </div>

        {step < 4 && (
          <div className="mb-6 flex items-center justify-between gap-2 px-1">
            {STEPS.map((label, index) => {
              const stepNumber = index + 1;
              const completed = step > stepNumber;
              const active = step === stepNumber;

              return (
                <div
                  key={label}
                  className="flex flex-1 items-center last:flex-none"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition ${
                        completed
                          ? "bg-emerald-600 text-white"
                          : active
                            ? "bg-slate-900 text-white ring-4 ring-slate-900/10"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        stepNumber
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        active ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${
                        completed ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Secure password recovery
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="email-step"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-sm leading-6 text-slate-500">
                      Enter the email linked to your HireLoop account. We will
                      send a 6-digit verification code.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Registered email
                    </label>

                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@college.edu"
                        autoComplete="email"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Send verification code
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Remembered your password?{" "}
                    <Link
                      to="/login"
                      className="font-bold text-emerald-700 transition hover:text-emerald-800"
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="otp-step"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleVerifyOtp}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <Mail className="h-5 w-5" />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-900">
                      Check your inbox
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A code was sent to{" "}
                      <span className="font-bold text-slate-700">{email}</span>.
                    </p>
                  </div>

                  <div>
                    <label className="mb-3 block text-center text-sm font-bold text-slate-700">
                      Enter the 6-digit code
                    </label>

                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Verify code
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="space-y-3 text-center">
                    {cooldown > 0 ? (
                      <p className="text-xs font-medium text-slate-400">
                        You can resend a code in{" "}
                        <span className="font-bold text-slate-600">
                          {cooldown}s
                        </span>
                        .
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-xs font-bold text-violet-700 transition hover:text-violet-800 disabled:opacity-50"
                      >
                        Resend verification code
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={changeEmail}
                      className="mx-auto flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Change email address
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="password-step"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                      <p className="text-sm leading-6 text-emerald-900">
                        Your email has been verified. Set a new password for
                        your account.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-bold text-slate-700"
                    >
                      New password
                    </label>

                    <div className="relative mt-2">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword((current) => !current)
                        }
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Confirm new password
                    </label>

                    <div className="relative mt-2">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Re-enter your new password"
                        autoComplete="new-password"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${
                          passwordsMatch
                            ? "text-emerald-700"
                            : "text-rose-600"
                        }`}
                      >
                        {passwordsMatch ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Passwords match
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            Passwords do not match
                          </>
                        )}
                      </motion.p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Reset password
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {step === 4 && (
                <motion.div
                  key="success-step"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  className="py-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 16,
                      delay: 0.1,
                    }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </motion.div>

                  <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                    Password updated
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Your password was changed successfully. Sign in using your
                    new password.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Return to sign in
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
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { getDashboardPath } from "../../utils/roleHelpers";

const Login = () => {
  const { login, isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const from = location.state?.from?.pathname;

    if (from) {
      navigate(from, { replace: true });
      return;
    }

    navigate(getDashboardPath(user), { replace: true });
  }, [isAuthenticated, user, navigate, location]);

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back to HireLoop.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();

    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/send-login-otp", { email });

      setOtpSent(true);
      toast.success(response.data.message || "A verification code was sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/verify-login-otp", {
        email,
        otp,
      });

      const { token, user: userData } = response.data.data;

      updateUser({ ...userData, token });
      toast.success("You are signed in.");
    } catch (err) {
      setError(err.response?.data?.message || "The verification code is invalid.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const switchLoginMethod = () => {
    setIsOtpMode((current) => !current);
    setOtpSent(false);
    setOtp("");
    setPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/15">
            <LockKeyhole className="h-6 w-6 text-emerald-400" />
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Welcome back
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Sign in to HireLoop
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Access your verified campus placement workspace.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Secure campus access
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5"
              >
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p className="text-sm font-medium leading-5 text-rose-700">
                  {error}
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {!isOtpMode ? (
                <motion.form
                  key="password-login"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                  onSubmit={handlePasswordLogin}
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-slate-700"
                    >
                      College email
                    </label>

                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@college.edu"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="password"
                        className="block text-sm font-bold text-slate-700"
                      >
                        Password
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-sm font-bold text-emerald-700 transition hover:text-emerald-800"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative mt-2">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Sign in securely
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-login"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                  onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                >
                  <div>
                    <label
                      htmlFor="otp-email"
                      className="block text-sm font-bold text-slate-700"
                    >
                      College email
                    </label>

                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="otp-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@college.edu"
                        required
                        disabled={otpSent}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label
                        htmlFor="otp"
                        className="block text-sm font-bold text-slate-700"
                      >
                        Verification code
                      </label>

                      <div className="relative mt-2">
                        <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder="123456"
                          required
                          value={otp}
                          onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, ""))
                          }
                          className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold tracking-[0.35em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                        />
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Enter the code sent to <strong>{email}</strong>.
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : otpSent ? (
                      <>
                        Verify and sign in
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Send verification code
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={switchLoginMethod}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            >
              {isOtpMode ? (
                <LockKeyhole className="h-4 w-4" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}

              {isOtpMode ? "Use password instead" : "Use email verification code"}
            </button>
          </div>
        </div>

        <p className="mt-7 text-center text-sm text-slate-500">
          New to HireLoop?{" "}
          <Link
            to="/register"
            className="font-bold text-emerald-700 transition hover:text-emerald-800"
          >
            Create your account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
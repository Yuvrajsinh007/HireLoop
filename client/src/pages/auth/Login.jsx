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
  GraduationCap,
  Sparkles,
  Building2,
  Users
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
      const response = await api.post("/auth/verify-login-otp", { email, otp });
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
    <div className="min-h-screen flex bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] 2xl:w-[640px] shadow-2xl z-10 bg-white relative">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          
          <div className="mb-10 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-10 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">HireLoop</span>
            </Link>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Access your campus placement workspace.
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
              >
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p className="text-sm font-medium leading-5 text-rose-800">
                  {error}
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {!isOtpMode ? (
                <motion.form
                  key="password-login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                  onSubmit={handlePasswordLogin}
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                      Email address
                    </label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        placeholder="you@college.edu"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative mt-2">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((curr) => !curr)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-login"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                  onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                >
                  <div>
                    <label htmlFor="otp-email" className="block text-sm font-bold text-gray-700">
                      Email address
                    </label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        id="otp-email"
                        type="email"
                        placeholder="you@college.edu"
                        required
                        disabled={otpSent}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label htmlFor="otp" className="block text-sm font-bold text-gray-700 mt-5">
                        Verification code
                      </label>
                      <div className="relative mt-2">
                        <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="123456"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm font-bold tracking-widest text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                      </div>
                      <p className="mt-2 text-xs font-medium text-gray-500">
                        Enter the 6-digit code sent to {email}
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (otpSent ? <>Verify and sign in <ArrowRight className="h-4 w-4" /></> : <>Send code <ArrowRight className="h-4 w-4" /></>)}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="my-7 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={switchLoginMethod}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            >
              {isOtpMode ? <LockKeyhole className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
              {isOtpMode ? "Sign in with password" : "Sign in with One-Time Password"}
            </button>

            <p className="mt-8 text-center text-sm font-medium text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side: SaaS Graphic/Info */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-indigo-900 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600 blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-indigo-500 blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-800 blur-3xl opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full p-16 lg:p-20 xl:p-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-800/50 border border-indigo-700/50 mb-8 backdrop-blur-md text-indigo-200 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              Streamlining Campus Placements
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              Connect top talent with leading companies.
            </h1>
            <p className="text-lg text-indigo-200 mb-12 max-w-lg leading-relaxed">
              HireLoop is the unified platform for students, placement cells, and recruiters to seamlessly manage the entire hiring journey.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <GraduationCap className="w-6 h-6" />, title: "Student Portfolios", desc: "Showcase skills, projects, and academics effortlessly." },
                { icon: <Building2 className="w-6 h-6" />, title: "Drive Management", desc: "Automate shortlisting, interviews, and final offers." },
                { icon: <Users className="w-6 h-6" />, title: "Alumni Network", desc: "Build connections and share invaluable interview experiences." },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-800/30 border border-indigo-700/30 backdrop-blur-sm transition-colors hover:bg-indigo-800/40">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-indigo-600/50 text-indigo-100">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-indigo-200">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
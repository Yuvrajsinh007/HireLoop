import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { sendLoginOtp, verifyLoginOtp } from "../../services/authService";
import OtpInput from "../../components/common/OtpInput";
import { Eye, EyeOff, Loader2, GraduationCap, KeyRound, Mail } from "lucide-react";

const COOLDOWN = 60;

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, updateUser } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  // ── Tab state ─────────────────────────────────────────────────────────
  const [tab, setTab] = useState("password"); // "password" | "otp"

  // ── Password login state ───────────────────────────────────────────────
  const [form, setForm]               = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [pwLoading, setPwLoading]     = useState(false);

  // ── OTP login state ────────────────────────────────────────────────────
  const [otpEmail, setOtpEmail]       = useState("");
  const [otp, setOtp]                 = useState("");
  const [otpSent, setOtpSent]         = useState(false);
  const [otpLoading, setOtpLoading]   = useState(false);
  const [cooldown, setCooldown]       = useState(0);

  const redirectUser = (user) => {
    if (user.role === "admin")   navigate("/admin/dashboard");
    else if (user.role === "officer") navigate("/officer/dashboard");
    else navigate(from);
  };

  // ── Password Login ─────────────────────────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill in all fields");
    try {
      setPwLoading(true);
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}! 👋`);
      redirectUser(user);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setPwLoading(false);
    }
  };

  // ── Send Login OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail) return toast.error("Please enter your email");
    try {
      setOtpLoading(true);
      await sendLoginOtp(otpEmail);
      setOtpSent(true);
      setOtp("");
      toast.success("OTP sent to your email!");
      startCooldown();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Verify Login OTP ───────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Please enter the 6-digit OTP");
    try {
      setOtpLoading(true);
      const res  = await verifyLoginOtp(otpEmail, otp);
      const data = res.data.data;
      // Store token and update auth context
      localStorage.setItem("hireloop_token", data.token);
      localStorage.setItem("hireloop_user", JSON.stringify(data.user));
      updateUser(data.user);
      // Force page reload to reinitialize auth
      toast.success(`Welcome, ${data.user.name.split(" ")[0]}! 👋`);
      window.location.href = data.user.role === "admin"
        ? "/admin/dashboard"
        : data.user.role === "officer"
        ? "/officer/dashboard"
        : from;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
      setOtp("");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Cooldown timer ─────────────────────────────────────────────────────
  const startCooldown = () => {
    setCooldown(COOLDOWN);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
          <button
            onClick={() => { setTab("password"); setOtpSent(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === "password" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <KeyRound className="w-4 h-4" /> Password Login
          </button>
          <button
            onClick={() => { setTab("otp"); setOtpSent(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === "otp" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Mail className="w-4 h-4" /> OTP Login
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── Password Login ── */}
          {tab === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="College Email" autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-10"
                    placeholder="••••••••" autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={pwLoading}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                {pwLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>
            </form>
          )}

          {/* ── OTP Login ── */}
          {tab === "otp" && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-500">Enter your registered email and we'll send you a 6-digit login code.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="College Email" autoComplete="email"
                />
              </div>
              <button type="submit" disabled={otpLoading}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
              </button>
            </form>
          )}

          {tab === "otp" && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Check your inbox</p>
                <p className="text-xs text-gray-500 mt-1">
                  OTP sent to <span className="font-medium text-gray-700">{otpEmail}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter 6-digit OTP
                </label>
                <OtpInput value={otp} onChange={setOtp} disabled={otpLoading} />
              </div>

              <button type="submit" disabled={otpLoading || otp.length !== 6}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
              </button>

              <div className="text-center">
                {cooldown > 0 ? (
                  <p className="text-xs text-gray-400">Resend OTP in <span className="font-semibold text-gray-600">{cooldown}s</span></p>
                ) : (
                  <button type="button" onClick={handleSendOtp} disabled={otpLoading}
                    className="text-xs text-indigo-600 font-medium hover:underline disabled:opacity-50">
                    Resend OTP
                  </button>
                )}
                <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="block w-full text-xs text-gray-400 hover:text-gray-600 mt-1">
                  ← Change email
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-medium text-gray-400 uppercase">Or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700">
              Create one free
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 font-medium leading-relaxed">
            Use your official college email to access your verified campus community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
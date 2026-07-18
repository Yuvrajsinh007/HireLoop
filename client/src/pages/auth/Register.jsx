import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { lookupDomain } from "../../services/institutionService";
import { getDashboardPath } from "../../utils/roleHelpers";
import { Eye, EyeOff, Loader2, GraduationCap, Users } from "lucide-react";

const INTENTS = [
  { value: "student", label: "Current Student", icon: "🎓", desc: "I am currently enrolled in college" },
  { value: "alumni",  label: "Alumni",           icon: "🏅", desc: "I have graduated from college" },
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep]     = useState(1); // 1=email, 2=details, 3=intent
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [email, setEmail]   = useState("");
  const [institution, setInstitution] = useState(null);
  const [domainLoading, setDomainLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", password: "", confirmPassword: "",
    registrationIntent: "student",
  });

  // ── Step 1: Check email domain ─────────────────────────────────────────
  const handleEmailCheck = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@"))
      return toast.error("Please enter a valid email address");

    try {
      setDomainLoading(true);
      const res = await lookupDomain(email);
      const data = res.data.data;

      if (!data.found) {
        return toast.error(
          "Your institution is not registered on HireLoop. Ask your placement office to register."
        );
      }

      setInstitution(data.institution);
      setStep(2);
      toast.success(`Found: ${data.institution.name} ✅`);
    } catch {
      toast.error("Could not verify your email domain. Please try again.");
    } finally {
      setDomainLoading(false);
    }
  };

  // ── Step 2: Fill details ───────────────────────────────────────────────
  const handleDetailsNext = (e) => {
    e.preventDefault();
    if (!form.name.trim())        return toast.error("Name is required");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
    setStep(3);
  };

  // ── Step 3: Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await register({
        name:                form.name,
        email,
        password:            form.password,
        registrationIntent:  form.registrationIntent,
      });
      toast.success(`Welcome to HireLoop, ${user.name.split(" ")[0]}! 🎉`);
      navigate(getDashboardPath(user));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Verify Email", "Your Details", "Account Type"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">HireLoop</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-500 mt-2 text-sm">Join your campus placement community</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0
                ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? "text-indigo-600" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <div className={`flex-1 h-px ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── Step 1: Email check ── */}
          {step === 1 && (
            <form onSubmit={handleEmailCheck} className="space-y-5">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-500">Enter your college email to detect your institution automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">College Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="yourname@college.edu.in"
                  autoComplete="email"
                />
              </div>
              <button type="submit" disabled={domainLoading}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                {domainLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email →"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">Sign in</Link>
              </p>
            </form>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <form onSubmit={handleDetailsNext} className="space-y-5">
              {institution && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-2">
                  {institution.logo
                    ? <img src={institution.logo} alt={institution.name} className="w-10 h-10 rounded-lg object-cover" />
                    : <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">{institution.name?.[0]}</div>
                  }
                  <div>
                    <p className="text-sm font-semibold text-indigo-800">{institution.name}</p>
                    <p className="text-xs text-indigo-500">{email}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Your full name" autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
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
                  type={showPw ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Re-enter password"
                />
                {form.confirmPassword && (
                  <p className={`text-xs mt-1 ${form.password === form.confirmPassword ? "text-green-600" : "text-red-500"}`}>
                    {form.password === form.confirmPassword ? "✅ Passwords match" : "❌ Passwords do not match"}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" className="btn-primary flex-1">Continue →</button>
              </div>
            </form>
          )}

          {/* ── Step 3: Intent selection ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-600 font-medium text-center mb-2">
                I am joining HireLoop as a:
              </p>
              <div className="space-y-3">
                {INTENTS.map((intent) => (
                  <label key={intent.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${form.registrationIntent === intent.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                      }`}
                  >
                    <input
                      type="radio" name="registrationIntent" value={intent.value}
                      checked={form.registrationIntent === intent.value}
                      onChange={(e) => setForm((p) => ({ ...p, registrationIntent: e.target.value }))}
                      className="mt-1 accent-indigo-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{intent.icon}</span>
                        <span className="font-semibold text-gray-800">{intent.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{intent.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </span>
                  ) : "Create Account 🚀"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By registering, you agree to maintain academic integrity and authenticity.
        </p>
      </div>
    </div>
  );
};

export default Register;
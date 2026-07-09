import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const ROLES = [
  {
    value: "student",
    label: "Student",
    icon: "🎓",
    desc: "Currently pursuing degree, looking for placement",
  },
  {
    value: "senior",
    label: "Senior / Alumni",
    icon: "🏅",
    desc: "Already placed or graduated, want to help juniors",
  },
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 2-step registration

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Welcome to HireLoop, ${user.name.split(" ")[0]}! 🎉`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="w-full max-w-md fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">HireLoop</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-500 mt-1 text-sm">Join your campus placement community</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${step >= s ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"}`}
              >
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? "text-indigo-600" : "text-gray-400"}`}>
                {s === 1 ? "Your Details" : "Choose Role"}
              </span>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? "bg-indigo-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          {/* ── Step 1: Basic Details ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Yuvrajsinh Jadeja"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  College Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="21dce000@charusat.edu.in"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-base">
                Continue →
              </button>
            </form>
          )}

          {/* ── Step 2: Role Selection ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-600 font-medium mb-2">
                I am joining HireLoop as a:
              </p>

              <div className="space-y-3">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${form.role === r.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={handleChange}
                      className="mt-1 accent-indigo-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{r.icon}</span>
                        <span className="font-semibold text-gray-800">{r.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 py-3"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Account 🚀"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login link */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">already have account?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            <Link
              to="/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign in instead
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By registering, you agree to keep your data authentic and maintain academic integrity.
        </p>
      </div>
    </div>
  );
};

export default Register;
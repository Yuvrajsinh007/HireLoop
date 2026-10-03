import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { lookupDomain } from "../../services/institutionService";
import { getDashboardPath } from "../../utils/roleHelpers";

const INTENTS = [
  {
    value: "student",
    label: "Current student",
    Icon: GraduationCap,
    desc: "I am currently enrolled at this institution.",
  },
];

const STEPS = ["Verify", "Details", "Role"];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    registrationIntent: "student",
  });

  const handleEmailCheck = async (event) => {
    event.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Enter a valid college email address.");
      return;
    }

    try {
      setDomainLoading(true);

      const response = await lookupDomain(email);
      const data = response.data.data;

      if (!data.found) {
        toast.error("This institution is not registered on HireLoop yet.");
        return;
      }

      setInstitution(data.institution);
      setStep(2);
      toast.success(`${data.institution.name} verified.`);
    } catch {
      toast.error("We could not verify your institution domain.");
    } finally {
      setDomainLoading(false);
    }
  };

  const handleDetailsNext = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Enter your full name.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setStep(3);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const user = await register({
        name: form.name,
        email,
        password: form.password,
        registrationIntent: form.registrationIntent,
      });

      toast.success(`Welcome to HireLoop, ${user.name.split(" ")[0]}.`);
      navigate(getDashboardPath(user));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const passwordMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/15">
            <GraduationCap className="h-7 w-7 text-emerald-400" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Verified campus community
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Create your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Join your institution’s placement workspace.
          </p>
        </div>

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
                    {completed ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
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
                      step > stepNumber ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          {step === 1 && (
            <form onSubmit={handleEmailCheck} className="space-y-5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <p className="text-sm leading-6 text-emerald-900">
                    Use your official college email. We will identify your
                    institution automatically.
                  </p>
                </div>
              </div>

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
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@college.edu"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={domainLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {domainLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify institution
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="space-y-2 text-center text-sm text-slate-500">
                <p>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    Sign in
                  </Link>
                </p>

                <p>
                  Is your college not listed?{" "}
                  <Link
                    to="/register-institution"
                    className="font-bold text-violet-700 hover:text-violet-800"
                  >
                    Register your institution
                  </Link>
                </p>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleDetailsNext} className="space-y-5">
              {institution && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
                  {institution.logo ? (
                    <img
                      src={institution.logo}
                      alt={institution.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-emerald-950">
                      {institution.name}
                    </p>

                    <p className="truncate text-xs text-emerald-700">
                      {email}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative mt-2">
                  <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        password: event.target.value,
                      }))
                    }
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
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

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-bold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="Re-enter your password"
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
                      showConfirmPassword ? "Hide password" : "Show password"
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

                {form.confirmPassword && (
                  <p
                    className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${
                      passwordMatch ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {passwordMatch ? (
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
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  type="submit"
                  className="flex flex-[1.6] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">
                  How are you joining HireLoop?
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  This helps us create the right workspace for you.
                </p>
              </div>

              <div className="space-y-3">
                {INTENTS.map(({ value, label, Icon, desc }) => {
                  const selected = form.registrationIntent === value;

                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                        selected
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 bg-white hover:border-violet-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="registrationIntent"
                        value={value}
                        checked={selected}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            registrationIntent: event.target.value,
                          }))
                        }
                        className="mt-1 accent-violet-600"
                      />

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-violet-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {label}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-[1.6] items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          By registering, you agree to use HireLoop responsibly and maintain
          academic integrity.
        </p>
      </div>
    </div>
  );
};

export default Register;
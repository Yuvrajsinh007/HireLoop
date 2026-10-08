import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
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
  Sparkles,
  Briefcase
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
        toast.error("This institution domain is not registered on HireLoop yet.");
        return;
      }
      setInstitution(data.institution);
      setStep(2);
      toast.success(`${data.institution.name} verified workspace found.`);
    } catch {
      toast.error("We could not verify your institution domain automatically.");
    } finally {
      setDomainLoading(false);
    }
  };

  const handleDetailsNext = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Enter your full name.");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");
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
        institutionId: institution?._id,
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

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] 2xl:w-[640px] shadow-2xl z-10 bg-white relative">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          
          <div className="mb-8 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-8 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">HireLoop</span>
            </Link>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Join your verified institution’s placement workspace.
            </p>
          </div>

          <div className="mb-8 flex items-center justify-between gap-2">
            {STEPS.map((label, index) => {
              const stepNumber = index + 1;
              const completed = step > stepNumber;
              const active = step === stepNumber;

              return (
                <div key={label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-colors ${completed ? "bg-indigo-600 text-white" : active ? "bg-gray-900 text-white ring-4 ring-gray-900/10" : "bg-gray-100 text-gray-400"}`}>
                      {completed ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-gray-900" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`mx-2 mb-5 h-[2px] flex-1 rounded-full transition-colors ${step > stepNumber ? "bg-indigo-500" : "bg-gray-100"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleEmailCheck} className="space-y-5">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                      <p className="text-sm leading-relaxed text-indigo-900 font-medium">
                        Use your official college email. HireLoop matches your domain suffix to route you to your college portal.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700">College email</label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@college.edu" required className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={domainLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                    {domainLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify domain <ArrowRight className="h-4 w-4" /></>}
                  </button>
                  <div className="pt-4 space-y-3 text-center text-sm font-medium text-gray-500">
                    <p>Already have an account? <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">Sign in</Link></p>
                    <p>College not listed? <Link to="/register-institution" className="font-bold text-indigo-600 hover:text-indigo-500">Register institution</Link></p>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleDetailsNext} className="space-y-5">
                  {institution && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-emerald-950">{institution.name}</p>
                        <p className="truncate text-xs font-medium text-emerald-700 mt-0.5">Domain match: @{institution.domain}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-700">Full name</label>
                    <div className="relative mt-2">
                      <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input id="name" type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your full name" required className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password</label>
                    <div className="relative mt-2">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="At least 6 characters" required className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                      <button type="button" onClick={() => setShowPassword((curr) => !curr)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-bold text-gray-700">Confirm password</label>
                    <div className="relative mt-2">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Re-enter password" required className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                      <button type="button" onClick={() => setShowConfirmPassword((curr) => !curr)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button type="submit" className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    {INTENTS.map(({ value, label, Icon, desc }) => (
                      <label key={value} className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/50 p-5 transition-all">
                        <input type="radio" name="registrationIntent" value={value} checked readOnly className="mt-1 accent-indigo-600" />
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{label}</p>
                          <p className="mt-1 text-xs font-medium text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button type="submit" disabled={loading} className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <>Create account <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
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
              Join Your Campus Network
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              Launch your career with HireLoop.
            </h1>
            <p className="text-lg text-indigo-200 mb-12 max-w-lg leading-relaxed">
              Verify your college identity and gain instant access to exclusive placement drives, resources, and recruiter connections.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <Briefcase className="w-6 h-6" />, title: "Exclusive Opportunities", desc: "Access job drives strictly organized for your institution." },
                { icon: <ShieldCheck className="w-6 h-6" />, title: "Verified Profiles", desc: "Stand out to recruiters with a college-verified student profile." },
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

export default Register;
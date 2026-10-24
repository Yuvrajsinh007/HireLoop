import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft, ArrowRight, Building2, CheckCircle2, Eye, EyeOff,
  GraduationCap, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound,
  Sparkles, Briefcase, BookOpen, Calendar as CalendarIcon, Hash
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { getDashboardPath } from "../../utils/roleHelpers";
import OtpInput from "../../components/common/OtpInput";

const STEPS = ["Email", "OTP", "Details"];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // Data fetched from backend
  const [institution, setInstitution] = useState(null);
  const [academicUnits, setAcademicUnits] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    rollNumber: "",
    academicUnit: "",
    program: "",
    enrollmentYear: "",
    graduationYear: "",
  });

  // STEP 1: Check Domain & Trigger OTP Email
  const handleEmailCheck = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return toast.error("Enter a valid college email address.");
    }

    try {
      setDomainLoading(true);
      const response = await api.post("/auth/register/start", { email: cleanEmail });
      
      const data = response.data.data;
      setInstitution(data.institution);
      setAcademicUnits(data.academicUnits || []);
      setPrograms(data.programs || []);
      
      setStep(2);
      toast.success(`Workspace found! Verification code sent to ${cleanEmail}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not verify domain or send OTP.");
    } finally {
      setDomainLoading(false);
    }
  };

  // STEP 2: Verify the OTP
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) return toast.error("Enter the complete 6-digit code.");
    
    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      await api.post("/auth/register/verify-otp", { email: cleanEmail, otp });
      setStep(3);
      toast.success("Email verified successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Final Registration & Validation
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validations
    if (!form.name.trim()) return toast.error("Enter your full name.");
    if (!form.rollNumber.trim()) return toast.error("Enter your roll number.");
    if (!form.academicUnit || !form.program) return toast.error("Select your Institute and Branch.");
    if (!form.enrollmentYear || !form.graduationYear) return toast.error("Enter your academic years.");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");
    
    try {
      setLoading(true);
      const user = await register({
        name: form.name,
        email: email.trim().toLowerCase(),
        password: form.password,
        institutionId: institution?._id,
        rollNumber: form.rollNumber.toUpperCase(), // Ensure roll numbers are consistent
        academicUnit: form.academicUnit,
        program: form.program,
        enrollmentYear: Number(form.enrollmentYear),
        graduationYear: Number(form.graduationYear),
        registrationIntent: "student", // Hardcoded as this flow is strictly for students
        otp, 
      });
      toast.success(`Welcome to HireLoop, ${user.name.split(" ")[0]}.`);
      navigate(getDashboardPath(user));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
      if (err?.response?.data?.message?.toLowerCase().includes("otp")) {
        setStep(2); // Kick back to OTP if it expired during data entry
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:w-[500px] xl:w-[600px] 2xl:w-[700px] shadow-2xl z-10 bg-white relative overflow-y-auto max-h-screen">
        <div className="mx-auto w-full max-w-md lg:w-[450px] my-auto">
          
          <div className="mb-8 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-8 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">HireLoop</span>
            </Link>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">Join your verified institution’s placement workspace.</p>
          </div>

          {/* Stepper Navigation */}
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
              {/* STEP 1: Verify Domain */}
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

              {/* STEP 2: OTP Verification */}
              {step === 2 && (
                <motion.form key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                      <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Check your email</h3>
                    <p className="mt-1 text-sm text-gray-500">We sent a verification code to <span className="font-bold text-gray-700">{email}</span></p>
                  </div>
                  
                  <div>
                    <label className="block text-center text-sm font-bold text-gray-700 mb-3">Enter the 6-digit code</label>
                    <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button type="submit" disabled={loading || otp.length !== 6} className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify Code <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: Details & Academic Setup */}
              {step === 3 && (
                <motion.form key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-bold text-gray-700">Full name *</label>
                      <div className="relative mt-1">
                        <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input id="name" type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your full name" required className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700">Roll / Enrollment Number *</label>
                      <div className="relative mt-1">
                        <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={form.rollNumber} onChange={(e) => setForm((p) => ({ ...p, rollNumber: e.target.value }))} placeholder="e.g. 23DCE043" required className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none uppercase" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700">Institute / Academic Unit *</label>
                      <div className="relative mt-1">
                        <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select required value={form.academicUnit} onChange={(e) => setForm(p => ({ ...p, academicUnit: e.target.value, program: "" }))} className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none">
                          <option value="">-- Select Institute --</option>
                          {academicUnits.map(unit => <option key={unit._id} value={unit._id}>{unit.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700">Branch / Program *</label>
                      <div className="relative mt-1">
                        <BookOpen className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select required value={form.program} onChange={(e) => setForm(p => ({ ...p, program: e.target.value }))} disabled={!form.academicUnit} className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none disabled:bg-gray-100 disabled:text-gray-400">
                          <option value="">-- Select Branch --</option>
                          {programs.filter(p => p.academicUnit === form.academicUnit || p.academicUnit?._id === form.academicUnit).map(prog => (
                            <option key={prog._id} value={prog._id}>{prog.name} ({prog.degreeType})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700">Start Year *</label>
                      <div className="relative mt-1">
                        <CalendarIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="number" value={form.enrollmentYear} onChange={(e) => setForm((p) => ({ ...p, enrollmentYear: e.target.value }))} placeholder="e.g. 2023" required min="2000" className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700">Grad Year *</label>
                      <div className="relative mt-1">
                        <CalendarIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="number" value={form.graduationYear} onChange={(e) => setForm((p) => ({ ...p, graduationYear: e.target.value }))} placeholder="e.g. 2027" required min="2020" className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                      </div>
                    </div>

                    <div className="md:col-span-2 pt-2">
                      <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password *</label>
                      <div className="relative mt-1">
                        <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="At least 6 characters" required minLength={6} className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-11 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                        <button type="button" onClick={() => setShowPassword((curr) => !curr)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="confirm-password" className="block text-sm font-bold text-gray-700">Confirm password *</label>
                      <div className="relative mt-1">
                        <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Re-enter password" required minLength={6} className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-11 text-sm text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                        <button type="button" onClick={() => setShowConfirmPassword((curr) => !curr)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
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
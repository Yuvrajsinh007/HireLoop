import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import OtpInput from "../../components/common/OtpInput";
import { useAuth } from "../../hooks/useAuth";
import { getMemberProfile, updateMemberProfile, uploadAvatar, uploadResume } from "../../services/memberService";
import { sendVerifyOtp, verifyEmailOtp } from "../../services/authService";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Mail, Loader2, Edit2, X, FileText, Upload, Briefcase } from "lucide-react";

const SKILL_SUGGESTIONS = [
  "React", "Node.js", "MongoDB", "Express", "JavaScript", "Python", "Java",
  "C++", "SQL", "Git", "Docker", "AWS", "TypeScript", "Redux", "Next.js",
  "Spring Boot", "MySQL", "PostgreSQL", "REST API", "GraphQL",
];

const COOLDOWN = 60;

const Profile = () => {
  const { user, updateUser, isAlumni } = useAuth();
  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState("");
  const [editMode, setEditMode]   = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [topicInput, setTopicInput] = useState("");

  // Email Verification OTP state
  const [showVerifySection, setShowVerifySection] = useState(false);
  const [otpSent, setOtpSent]     = useState(false);
  const [otp, setOtp]             = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [cooldown, setCooldown]   = useState(0);

  const [form, setForm] = useState({
    rollNumber: "", enrollmentYear: "", graduationYear: "", cgpa: "", activeBacklogs: 0,
    skills: [], linkedIn: "", github: "", portfolio: "", bio: "", alternateEmail: "",
    isAvailableForMentorship: false, mentorshipTopics: [],
    currentCompany: "", currentRole: "", currentCTC: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getMemberProfile(); // Maps to getProfile in controller
        const p   = res.data.data;
        setProfile(p);
        setForm({
          rollNumber: p.rollNumber || "",
          enrollmentYear: p.enrollmentYear || "",
          graduationYear: p.graduationYear || "",
          cgpa: p.cgpa || "",
          activeBacklogs: p.activeBacklogs || 0,
          skills: p.skills || [],
          linkedIn: p.linkedIn || "",
          github: p.github || "",
          portfolio: p.portfolio || "",
          bio: p.bio || "",
          alternateEmail: p.user?.alternateEmail || "",
          isAvailableForMentorship: p.isAvailableForMentorship || false,
          mentorshipTopics: p.mentorshipTopics || [],
          currentCompany: p.currentCompany || "",
          currentRole: p.currentRole || "",
          currentCTC: p.currentCTC || "",
        });
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendVerifyOtp = async () => {
    try {
      setVerifyLoading(true);
      await sendVerifyOtp();
      setOtpSent(true);
      setOtp("");
      toast.success("OTP sent to your email!");
      startCooldown();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (otp.length !== 6) return toast.error("Please enter the 6-digit OTP");
    try {
      setVerifyLoading(true);
      await verifyEmailOtp(otp);
      updateUser({ isEmailVerified: true });
      toast.success("Email verified successfully! ✅");
      setShowVerifySection(false);
      setOtpSent(false);
      setOtp("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP");
      setOtp("");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addArrayItem = (field, value, setInput) => {
    const s = value.trim();
    if (!s || form[field].includes(s)) return;
    setForm((p) => ({ ...p, [field]: [...p[field], s] }));
    setInput("");
  };

  const removeArrayItem = (field, value) =>
    setForm((p) => ({ ...p, [field]: p[field].filter((item) => item !== value) }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateMemberProfile(form); // Maps to updateProfile in controller
      setProfile(res.data.data);
      setEditMode(false);
      if (form.alternateEmail) updateUser({ alternateEmail: form.alternateEmail });
      toast.success("Profile updated successfully ✅");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append(type, file);
    try {
      setUploading(type);
      if (type === "avatar") {
        const res = await uploadAvatar(fd);
        updateUser({ avatar: res.data.data.avatarUrl });
        toast.success("Profile photo updated!");
      } else {
        const res = await uploadResume(fd);
        setProfile((p) => ({ ...p, resumeUrl: res.data.data.resumeUrl }));
        toast.success("Resume uploaded!");
      }
    } catch (err) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading("");
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading profile..." />
      </div>
    </DashboardLayout>
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your academic and professional details</p>
          </div>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Edit2 className="w-4 h-4 mr-2 text-gray-500" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setEditMode(false)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Email Verification Banner ── */}
        <AnimatePresence>
          {!user?.isEmailVerified && (
            <motion.div variants={itemVariants} exit={{ opacity: 0, height: 0 }} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-800 text-sm">Email not verified</p>
                    <p className="text-sm text-yellow-700 mt-0.5">
                      Verify your institutional email <strong>{user?.email}</strong> to unlock placement features.
                    </p>
                  </div>
                </div>
                {!showVerifySection && (
                  <button
                    onClick={() => setShowVerifySection(true)}
                    className="text-sm font-semibold text-yellow-800 bg-yellow-200 hover:bg-yellow-300 px-4 py-2 rounded-md transition-colors flex-shrink-0"
                  >
                    Verify Email
                  </button>
                )}
              </div>

              {/* OTP Section */}
              <AnimatePresence>
                {showVerifySection && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-yellow-200"
                  >
                    {!otpSent ? (
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-sm text-yellow-700">Click below to receive a 6-digit OTP on your email.</p>
                        <button onClick={handleSendVerifyOtp} disabled={verifyLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70">
                          {verifyLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Send OTP"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-md">
                        <p className="text-sm text-yellow-700">
                          OTP sent to <strong>{user?.email}</strong>. Enter it below:
                        </p>
                        <OtpInput value={otp} onChange={setOtp} disabled={verifyLoading} />
                        <div className="flex items-center gap-3">
                          <button onClick={handleVerifyEmailOtp} disabled={verifyLoading || otp.length !== 6} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70">
                            {verifyLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Verify OTP"}
                          </button>
                          {cooldown > 0 ? (
                            <span className="text-sm text-yellow-700">Resend in {cooldown}s</span>
                          ) : (
                            <button onClick={handleSendVerifyOtp} disabled={verifyLoading} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verified Badge */}
        {user?.isEmailVerified && (
          <motion.div variants={itemVariants} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 shadow-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">Your institutional email is verified.</p>
          </motion.div>
        )}

        {/* Avatar & Basic Info Card */}
        <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <Avatar src={user?.avatarUrl} name={user?.name} size="xl" />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-colors"
                title="Update Avatar"
              >
                {uploading === "avatar" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "avatar")} />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm mb-2">{user?.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user?.role}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {user?.academicStatus?.replace("_", " ")}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {user?.employmentStatus}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2 mt-4 sm:mt-0">
              {profile?.resumeUrl ? (
                <>
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors">
                    <FileText className="w-4 h-4 mr-2" /> View Resume
                  </a>
                  <button onClick={() => resumeInputRef.current?.click()} className="text-xs text-gray-500 hover:text-indigo-600 text-center sm:text-right font-medium transition-colors">
                    {uploading === "resume" ? "Uploading..." : "Replace Resume"}
                  </button>
                </>
              ) : (
                <button onClick={() => resumeInputRef.current?.click()} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  {uploading === "resume" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2 text-gray-500" />} Upload Resume
                </button>
              )}
              <input ref={resumeInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, "resume")} />
            </div>
          </div>
        </motion.div>

        {/* Academic Info */}
        <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Academic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Read-only structured data */}
            <div>
              <label className="block text-sm font-medium text-gray-500">Institution</label>
              <p className="mt-1 text-sm text-gray-900 font-medium">{profile?.institution?.name || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Academic Unit</label>
              <p className="mt-1 text-sm text-gray-900 font-medium">{profile?.academicUnit?.name || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Program</label>
              <p className="mt-1 text-sm text-gray-900 font-medium">{profile?.program?.name || "—"}</p>
            </div>

            {/* Editable data */}
            {[
              { label: "Roll Number", name: "rollNumber", type: "text" },
              { label: "Enrollment Year", name: "enrollmentYear", type: "number" },
              { label: "Graduation Year", name: "graduationYear", type: "number" },
              { label: "CGPA", name: "cgpa", type: "number", step: "0.01" },
              { label: "Active Backlogs", name: "activeBacklogs", type: "number" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700">{f.label}</label>
                {editMode ? (
                  <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} step={f.step}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" />
                ) : (
                  <p className="mt-1 text-sm text-gray-900 font-medium">{profile?.[f.name] ?? "—"}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Technical Skills</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(editMode ? form.skills : profile?.skills || []).map((skill) => (
              <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                {skill}
                {editMode && (
                  <button onClick={() => removeArrayItem("skills", skill)} className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600 focus:outline-none">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
            {(!editMode && !profile?.skills?.length) && <p className="text-sm text-gray-400 italic">No skills added yet.</p>}
          </div>

          {editMode && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addArrayItem("skills", skillInput, setSkillInput)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Type a skill and press Enter" />
                <button type="button" onClick={() => addArrayItem("skills", skillInput, setSkillInput)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILL_SUGGESTIONS.filter((s) => !form.skills.includes(s)).map((s) => (
                  <button key={s} type="button" onClick={() => addArrayItem("skills", s, setSkillInput)}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Bio & Social Links */}
        <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Bio & Social Links</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              {editMode ? (
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none transition-colors" placeholder="Tell recruiters about yourself..." />
              ) : (
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100 min-h-[3rem]">{profile?.bio || <span className="text-gray-400 italic">No bio provided.</span>}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "LinkedIn", name: "linkedIn", placeholder: "https://linkedin.com/in/username" },
                { label: "GitHub", name: "github", placeholder: "https://github.com/username" },
                { label: "Portfolio", name: "portfolio", placeholder: "https://yourwebsite.com" },
                { label: "Alternate Email", name: "alternateEmail", placeholder: "personal@gmail.com" },
              ].map((link) => (
                <div key={link.name}>
                  <label className="block text-sm font-medium text-gray-700">{link.label}</label>
                  {editMode ? (
                    <input type={link.name === "alternateEmail" ? "email" : "url"} name={link.name} value={form[link.name]} onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" placeholder={link.placeholder} />
                  ) : form[link.name] ? (
                    <a href={link.name === "alternateEmail" ? `mailto:${form[link.name]}` : form[link.name]} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate">
                      {form[link.name]}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400 italic">Not provided</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Alumni / Mentorship Settings (Only shown if graduated or available for mentorship) */}
        {(isAlumni || editMode || profile?.isAvailableForMentorship) && (
          <motion.div variants={itemVariants} className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Professional & Mentorship Details</h3>
            
            {isAlumni && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-100">
                {[
                  { label: "Current Company", name: "currentCompany" },
                  { label: "Current Role", name: "currentRole" },
                  { label: "Current CTC (LPA)", name: "currentCTC", type: "number", step: "0.1" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700">{f.label}</label>
                    {editMode ? (
                      <input type={f.type || "text"} name={f.name} value={form[f.name]} onChange={handleChange} step={f.step}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900 font-medium">{profile?.[f.name] || "—"}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input type="checkbox" name="isAvailableForMentorship" checked={form.isAvailableForMentorship} onChange={handleChange} disabled={!editMode}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded disabled:opacity-60 cursor-pointer" />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Available for Mentorship</label>
                  <p className="text-gray-500">Allow the placement office to contact you for guiding juniors.</p>
                </div>
              </div>

              {(form.isAvailableForMentorship || (!editMode && profile?.mentorshipTopics?.length > 0)) && (
                <div className="mt-4 pl-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mentorship Topics</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(editMode ? form.mentorshipTopics : profile?.mentorshipTopics || []).map((topic) => (
                      <span key={topic} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {topic}
                        {editMode && (
                          <button onClick={() => removeArrayItem("mentorshipTopics", topic)} className="ml-1.5 inline-flex text-green-600 hover:text-green-800 focus:outline-none">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {editMode && (
                    <div className="flex gap-2 max-w-sm">
                      <input type="text" value={topicInput} onChange={(e) => setTopicInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addArrayItem("mentorshipTopics", topicInput, setTopicInput)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Resume Review" />
                      <button type="button" onClick={() => addArrayItem("mentorshipTopics", topicInput, setTopicInput)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
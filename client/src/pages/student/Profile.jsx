import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import OtpInput from "../../components/common/OtpInput";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import {
  getMemberProfile,
  updateMemberProfile,
  uploadAvatar,
  uploadResume,
} from "../../services/memberService";
import {
  sendVerifyOtp,
  verifyEmailOtp,
} from "../../services/authService";
import { isMember } from "../../utils/roleHelpers";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Mail,
  Loader2,
  Edit2,
  X,
  FileText,
  Upload,
  ShieldCheck,
  UserRound,
  Lock,
} from "lucide-react";

const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "MongoDB",
  "Express",
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "SQL",
  "Git",
  "Docker",
  "AWS",
  "TypeScript",
  "Redux",
  "Next.js",
  "Spring Boot",
  "MySQL",
  "PostgreSQL",
  "REST API",
  "GraphQL",
];

const COOLDOWN = 60;

const Profile = () => {
  const { user, updateUser } = useAuth();

  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const studentView = isMember(user);

  const [activeTab, setActiveTab] = useState("general");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // Email verification state
  const [showVerifySection, setShowVerifySection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Show the success banner only immediately after verification.
  const [justVerified, setJustVerified] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [form, setForm] = useState({
    rollNumber: "",
    enrollmentYear: "",
    graduationYear: "",
    cgpa: "",
    activeBacklogs: 0,
    skills: [],
    linkedIn: "",
    github: "",
    portfolio: "",
    bio: "",
    alternateEmail: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        const res = await getMemberProfile();
        const p = res.data.data;

        setProfile(p);

        if (studentView) {
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
          });
        }
      } catch {
        toast.error("Failed to load profile details");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [studentView]);

  const startCooldown = () => {
    setCooldown(COOLDOWN);

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

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
      toast.error(
        err?.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (otp.length !== 6) {
      return toast.error("Please enter the 6-digit OTP");
    }

    try {
      setVerifyLoading(true);

      await verifyEmailOtp(otp);

      updateUser({ isEmailVerified: true });

      toast.success("Email verified successfully!");

      setShowVerifySection(false);
      setOtpSent(false);
      setOtp("");

      // Show the success banner for five seconds.
      setJustVerified(true);
      setTimeout(() => setJustVerified(false), 5000);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Invalid or expired OTP"
      );

      setOtp("");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const addArrayItem = (field, value, setInput) => {
    const s = value.trim();

    if (!s || form[field].includes(s)) return;

    setForm((p) => ({
      ...p,
      [field]: [...p[field], s],
    }));

    setInput("");
  };

  const removeArrayItem = (field, value) =>
    setForm((p) => ({
      ...p,
      [field]: p[field].filter((item) => item !== value),
    }));

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      await updateMemberProfile(form);

      const freshRes = await getMemberProfile();

      setProfile(freshRes.data.data);
      setEditMode(false);

      if (form.alternateEmail) {
        updateUser({ alternateEmail: form.alternateEmail });
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    try {
      setSaving(true);

      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password updated securely");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update password"
      );
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

        updateUser({
          avatar: res.data.data.avatarUrl,
        });

        toast.success("Profile photo updated!");
      } else {
        const res = await uploadResume(fd);

        setProfile((p) => ({
          ...p,
          resumeUrl: res.data.data.resumeUrl,
        }));

        toast.success("Resume uploaded!");
      }
    } catch {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading("");
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader size="lg" text="Loading settings..." />
        </div>
      </DashboardLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Header and Tabs */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Account Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal profile and security preferences.
          </p>

          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`flex items-center whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
                  activeTab === "general"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <UserRound className="mr-2 h-4 w-4" />
                Profile Info
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex items-center whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
                  activeTab === "security"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Lock className="mr-2 h-4 w-4" />
                Security
              </button>
            </nav>
          </div>
        </motion.div>

        {/* General Tab */}
        {activeTab === "general" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Edit Button */}
            {studentView && (
              <div className="mb-4 flex justify-end">
                {!editMode ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <Edit2 className="mr-2 h-4 w-4 text-gray-500" />
                    Edit Details
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-70"
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Email Verification Banner */}
            <AnimatePresence>
              {!user?.isEmailVerified && (
                <motion.div
                  key="unverified-banner"
                  variants={itemVariants}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />

                      <div>
                        <p className="text-sm font-semibold text-yellow-800">
                          Email not verified
                        </p>

                        <p className="mt-0.5 text-sm text-yellow-700">
                          Verify your email{" "}
                          <strong>{user?.email}</strong> to unlock full
                          platform features.
                        </p>
                      </div>
                    </div>

                    {!showVerifySection && (
                      <button
                        type="button"
                        onClick={() => setShowVerifySection(true)}
                        className="flex-shrink-0 rounded-md bg-yellow-200 px-4 py-2 text-sm font-semibold text-yellow-800 transition-colors hover:bg-yellow-300"
                      >
                        Verify Email
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showVerifySection && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 border-t border-yellow-200 pt-4"
                      >
                        {!otpSent ? (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-yellow-700">
                              Click below to receive a 6-digit OTP on your
                              email.
                            </p>

                            <button
                              type="button"
                              onClick={handleSendVerifyOtp}
                              disabled={verifyLoading}
                              className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 disabled:opacity-70"
                            >
                              {verifyLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                "Send OTP"
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="max-w-md space-y-4">
                            <p className="text-sm text-yellow-700">
                              OTP sent to <strong>{user?.email}</strong>.
                              Enter it below:
                            </p>

                            <OtpInput
                              value={otp}
                              onChange={setOtp}
                              disabled={verifyLoading}
                            />

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleVerifyEmailOtp}
                                disabled={
                                  verifyLoading || otp.length !== 6
                                }
                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70"
                              >
                                {verifyLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  "Verify OTP"
                                )}
                              </button>

                              {cooldown > 0 ? (
                                <span className="text-sm text-yellow-700">
                                  Resend in {cooldown}s
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendVerifyOtp}
                                  disabled={verifyLoading}
                                  className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
                                >
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

            {/* Email Verified Success Banner */}
            <AnimatePresence>
              {justVerified && (
                <motion.div
                  key="verified-success"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
                >
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />

                  <p className="text-sm font-medium text-emerald-800">
                    Your email has been verified successfully! 
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Identity Card */}
            <motion.div
              variants={itemVariants}
              className="mb-6 rounded-lg border border-gray-100 bg-white p-6 shadow"
            >
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="group relative">
                  <Avatar
                    src={user?.avatarUrl}
                    name={user?.name}
                    size="xl"
                  />

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-700"
                    title="Update Avatar"
                    aria-label="Update profile photo"
                  >
                    {uploading === "avatar" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "avatar")}
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.name}
                  </h2>

                  <p className="mb-2 text-sm text-gray-500">
                    {user?.email}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold capitalize tracking-wider text-indigo-800">
                      {user?.role}
                    </span>

                    {user?.institution && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold tracking-wider text-gray-800">
                        {user.institution.name}
                      </span>
                    )}

                    {user?.isEmailVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Resume: Students Only */}
                {studentView && (
                  <div className="mt-4 flex w-full flex-col items-stretch gap-2 sm:mt-0 sm:w-auto sm:items-end">
                    {profile?.resumeUrl ? (
                      <>
                        <a
                          href={profile.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Resume
                        </a>

                        <button
                          type="button"
                          onClick={() => resumeInputRef.current?.click()}
                          className="text-center text-xs font-medium text-gray-500 transition-colors hover:text-indigo-600 sm:text-right"
                        >
                          {uploading === "resume"
                            ? "Uploading..."
                            : "Replace Document"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                      >
                        {uploading === "resume" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4 text-gray-500" />
                        )}
                        Upload Resume
                      </button>
                    )}

                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "resume")}
                    />
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Academic Information */}
            {studentView && (
              <motion.div
                variants={itemVariants}
                className="mb-6 rounded-lg border border-gray-100 bg-white p-6 shadow"
              >
                <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                  Academic Details
                </h3>

                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <strong>Note:</strong> Your Institution, Institute, and
                  Branch are locked to verify your eligibility for placement
                  drives. Contact your administrator if these need changing.
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      label: "University",
                      value: profile?.institution?.name,
                    },
                    {
                      label: "Institution",
                      value: profile?.academicUnit?.name,
                    },
                    {
                      label: "Program / Branch",
                      value: profile?.program?.name,
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                        {f.label}
                      </label>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {f.value || "—"}
                      </p>
                    </div>
                  ))}
                </div>

                <hr className="mb-6 border-gray-100" />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      label: "Roll Number",
                      name: "rollNumber",
                      type: "text",
                    },
                    {
                      label: "Enrollment Year",
                      name: "enrollmentYear",
                      type: "number",
                      min: "2000",
                    },
                    {
                      label: "Graduation Year",
                      name: "graduationYear",
                      type: "number",
                      min: "2020",
                    },
                    {
                      label: "CGPA",
                      name: "cgpa",
                      type: "number",
                      step: "0.01",
                      min: "0",
                      max: "10",
                    },
                    {
                      label: "Active Backlogs",
                      name: "activeBacklogs",
                      type: "number",
                      min: "0",
                    },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                        {f.label}
                      </label>

                      {editMode ? (
                        <input
                          type={f.type}
                          name={f.name}
                          value={form[f.name]}
                          onChange={handleChange}
                          step={f.step}
                          min={f.min}
                          max={f.max}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {profile?.[f.name] ?? "—"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Technical Skills */}
            {studentView && (
              <motion.div
                variants={itemVariants}
                className="mb-6 rounded-lg border border-gray-100 bg-white p-6 shadow"
              >
                <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                  Technical Skills
                </h3>

                <div className="mb-4 flex flex-wrap gap-2">
                  {(editMode ? form.skills : profile?.skills || []).map(
                    (skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 shadow-sm"
                      >
                        {skill}

                        {editMode && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem("skills", skill)}
                            className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600"
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    )
                  )}

                  {!editMode && !profile?.skills?.length && (
                    <p className="text-sm italic text-gray-400">
                      No skills added yet.
                    </p>
                  )}
                </div>

                {editMode && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addArrayItem(
                              "skills",
                              skillInput,
                              setSkillInput
                            );
                          }
                        }}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        placeholder="Type a skill and press Enter"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          addArrayItem("skills", skillInput, setSkillInput)
                        }
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {SKILL_SUGGESTIONS.filter(
                        (s) => !form.skills.includes(s)
                      ).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            addArrayItem("skills", s, setSkillInput)
                          }
                          className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-300 hover:bg-gray-50 hover:text-indigo-600"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Bio and Social Links */}
            {studentView && (
              <motion.div
                variants={itemVariants}
                className="mb-6 rounded-lg border border-gray-100 bg-white p-6 shadow"
              >
                <h3 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                  Bio & Social Links
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                      Professional Summary
                    </label>

                    {editMode ? (
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full resize-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        placeholder="Tell recruiters about yourself..."
                      />
                    ) : (
                      <p className="mt-1 min-h-[3rem] rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-900 shadow-inner">
                        {profile?.bio || (
                          <span className="italic text-gray-400">
                            No bio provided.
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        label: "LinkedIn URL",
                        name: "linkedIn",
                        placeholder: "https://linkedin.com/in/username",
                      },
                      {
                        label: "GitHub URL",
                        name: "github",
                        placeholder: "https://github.com/username",
                      },
                      {
                        label: "Portfolio Website",
                        name: "portfolio",
                        placeholder: "https://yourwebsite.com",
                      },
                    ].map((link) => (
                      <div key={link.name}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                          {link.label}
                        </label>

                        {editMode ? (
                          <input
                            type="url"
                            name={link.name}
                            value={form[link.name]}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            placeholder={link.placeholder}
                          />
                        ) : form[link.name] ? (
                          <a
                            href={form[link.name]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block truncate text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {form[link.name]}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm italic text-gray-400">
                            Not provided
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={itemVariants}
              className="max-w-2xl rounded-lg border border-gray-100 bg-white p-6 shadow"
            >
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h3 className="flex items-center text-lg font-bold text-gray-900">
                  <ShieldCheck className="mr-2 h-5 w-5 text-indigo-500" />
                  Update Password
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Ensure your account is using a long, random password to
                  stay secure.
                </p>
              </div>

              <form
                onSubmit={handleUpdatePassword}
                className="space-y-5"
              >
                {[
                  {
                    label: "Current Password",
                    name: "currentPassword",
                  },
                  {
                    label: "New Password",
                    name: "newPassword",
                    placeholder: "At least 6 characters",
                  },
                  {
                    label: "Confirm New Password",
                    name: "confirmPassword",
                  },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="mb-1 block text-sm font-bold text-gray-700">
                      {f.label}
                    </label>

                    <input
                      required
                      type="password"
                      name={f.name}
                      minLength={
                        f.name !== "currentPassword" ? 6 : undefined
                      }
                      value={passwordForm[f.name]}
                      onChange={handlePasswordChange}
                      placeholder={f.placeholder}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-70"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
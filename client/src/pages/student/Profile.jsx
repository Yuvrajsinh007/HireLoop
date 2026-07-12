import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import OtpInput from "../../components/common/OtpInput";
import { useAuth } from "../../hooks/useAuth";
import { getStudentProfile, updateStudentProfile, uploadAvatar, uploadResume } from "../../services/studentService";
import { sendVerifyOtp, verifyEmailOtp } from "../../services/authService";
import { BRANCHES, PLACEMENT_STATUSES } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { CheckCircle, Mail, Loader2 } from "lucide-react";

const SKILL_SUGGESTIONS = [
  "React","Node.js","MongoDB","Express","JavaScript","Python","Java",
  "C++","SQL","Git","Docker","AWS","TypeScript","Redux","Next.js",
  "Spring Boot","MySQL","PostgreSQL","REST API","GraphQL",
];

const COOLDOWN = 60;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState("");
  const [editMode, setEditMode]   = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // ── Email Verification OTP state ──────────────────────────────────────
  const [showVerifySection, setShowVerifySection] = useState(false);
  const [otpSent, setOtpSent]     = useState(false);
  const [otp, setOtp]             = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [cooldown, setCooldown]   = useState(0);

  const [form, setForm] = useState({
    rollNumber: "", branch: "", batch: "", cgpa: "",
    skills: [], linkedIn: "", github: "", portfolio: "",
    bio: "", isAvailableForMentorship: false, placementStatus: "not_started",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getStudentProfile();
        const p   = res.data.data;
        setProfile(p);
        setForm({
          rollNumber: p.rollNumber || "",
          branch:     p.branch    || "",
          batch:      p.batch     || "",
          cgpa:       p.cgpa      || "",
          skills:     p.skills    || [],
          linkedIn:   p.linkedIn  || "",
          github:     p.github    || "",
          portfolio:  p.portfolio || "",
          bio:        p.bio       || "",
          isAvailableForMentorship: p.isAvailableForMentorship || false,
          placementStatus: p.placementStatus || "not_started",
        });
      } catch {
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

  // ── Send Verification OTP ─────────────────────────────────────────────
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

  // ── Verify Email OTP ──────────────────────────────────────────────────
  const handleVerifyEmailOtp = async () => {
    if (otp.length !== 6) return toast.error("Please enter the 6-digit OTP");
    try {
      setVerifyLoading(true);
      await verifyEmailOtp(otp);
      // Update auth context immediately — no logout needed
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

  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateStudentProfile(form);
      setProfile(res.data.data);
      setEditMode(false);
      toast.success("Profile updated successfully ✅");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      setUploading("avatar");
      const res = await uploadAvatar(fd);
      updateUser({ avatar: res.data.data.avatarUrl });
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading("");
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("resume", file);
    try {
      setUploading("resume");
      const res = await uploadResume(fd);
      setProfile((p) => ({ ...p, resumeUrl: res.data.data.resumeUrl }));
      toast.success("Resume uploaded!");
    } catch {
      toast.error("Failed to upload resume");
    } finally {
      setUploading("");
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" text="Loading profile..." />
      </div>
    </DashboardLayout>
  );

  const statusObj = PLACEMENT_STATUSES.find((s) => s.value === form.placementStatus);

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title mb-0">My Profile</h1>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="btn-secondary">✏️ Edit Profile</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* ── Email Verification Banner ── */}
        {!user?.isEmailVerified && (
          <div className="card mb-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800 text-sm">Email not verified</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Verify your email at <strong>{user?.email}</strong> to unlock all features.
                  </p>
                </div>
              </div>
              {!showVerifySection && (
                <button
                  onClick={() => setShowVerifySection(true)}
                  className="text-sm font-semibold text-yellow-800 bg-yellow-200 hover:bg-yellow-300 px-4 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  Verify Email
                </button>
              )}
            </div>

            {/* OTP Section */}
            {showVerifySection && (
              <div className="mt-4 pt-4 border-t border-yellow-200">
                {!otpSent ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-yellow-700 flex-1">Click to receive a 6-digit OTP on your email.</p>
                    <button
                      onClick={handleSendVerifyOtp}
                      disabled={verifyLoading}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-yellow-700 text-center">
                      OTP sent to <strong>{user?.email}</strong>. Enter it below:
                    </p>
                    <OtpInput value={otp} onChange={setOtp} disabled={verifyLoading} />
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleVerifyEmailOtp}
                        disabled={verifyLoading || otp.length !== 6}
                        className="btn-primary flex items-center gap-2"
                      >
                        {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP"}
                      </button>
                    </div>
                    <div className="text-center">
                      {cooldown > 0 ? (
                        <p className="text-xs text-yellow-600">Resend in <strong>{cooldown}s</strong></p>
                      ) : (
                        <button
                          onClick={handleSendVerifyOtp}
                          disabled={verifyLoading}
                          className="text-xs text-yellow-700 font-medium hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verified badge */}
        {user?.isEmailVerified && (
          <div className="card mb-6 border-green-200 bg-green-50 flex items-center gap-3 py-3 px-5">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-semibold text-green-800">Email Verified</p>
          </div>
        )}

        {/* Avatar Card */}
        <div className="card mb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar src={user?.avatar} name={user?.name} size="xl" />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-indigo-700 transition-colors shadow"
              >
                {uploading === "avatar" ? "⟳" : "✏️"}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="badge badge-indigo capitalize">{user?.role}</span>
                {statusObj && <span className={`badge ${statusObj.color}`}>{statusObj.label}</span>}
                {user?.isEmailVerified
                  ? <span className="badge badge-green">✅ Verified</span>
                  : <span className="badge badge-yellow">⚠️ Unverified</span>
                }
              </div>
            </div>

            <div className="text-right">
              {profile?.resumeUrl ? (
                <div className="space-y-1">
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-indigo-600 hover:underline font-medium">📄 View Resume</a>
                  <button onClick={() => resumeInputRef.current?.click()}
                    className="block text-xs text-gray-400 hover:text-gray-600 w-full text-right">
                    {uploading === "resume" ? "Uploading..." : "Replace"}
                  </button>
                </div>
              ) : (
                <button onClick={() => resumeInputRef.current?.click()} className="btn-secondary text-sm">
                  {uploading === "resume" ? "Uploading..." : "📄 Upload Resume"}
                </button>
              )}
              <input ref={resumeInputRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="card mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Academic Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Roll Number", name: "rollNumber", placeholder: "23DCE043" },
              { label: "Batch",       name: "batch",      placeholder: "2027", type: "number" },
              { label: "CGPA",        name: "cgpa",       placeholder: "9.02", type: "number", step: "0.01" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                {editMode ? (
                  <input type={f.type || "text"} name={f.name} value={form[f.name]}
                    onChange={handleChange} className="input-field text-sm" placeholder={f.placeholder} step={f.step} />
                ) : (
                  <p className="text-sm font-semibold text-gray-800">{profile?.[f.name] || "—"}</p>
                )}
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Branch</label>
              {editMode ? (
                <select name="branch" value={form.branch} onChange={handleChange} className="input-field text-sm">
                  <option value="">Select</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <p className="text-sm font-semibold text-gray-800">{profile?.branch || "—"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {(editMode ? form.skills : profile?.skills || []).map((skill) => (
              <span key={skill} className="badge badge-indigo flex items-center gap-1 text-sm px-3 py-1">
                {skill}
                {editMode && (
                  <button onClick={() => removeSkill(skill)} className="ml-1 text-indigo-400 hover:text-indigo-700">✕</button>
                )}
              </span>
            ))}
            {(!editMode && !profile?.skills?.length) && <p className="text-sm text-gray-400">No skills added yet</p>}
          </div>
          {editMode && (
            <>
              <div className="flex gap-2 mb-3">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill(skillInput)}
                  className="input-field text-sm flex-1" placeholder="Type a skill and press Enter" />
                <button onClick={() => addSkill(skillInput)} className="btn-primary px-4 text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_SUGGESTIONS.filter((s) => !form.skills.includes(s)).map((s) => (
                  <button key={s} onClick={() => addSkill(s)}
                    className="px-2.5 py-1 rounded-full text-xs border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bio & Links */}
        <div className="card mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Bio & Links</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
              {editMode ? (
                <textarea name="bio" value={form.bio} onChange={handleChange}
                  rows={3} className="input-field resize-none text-sm" placeholder="Tell others about yourself..." />
              ) : (
                <p className="text-sm text-gray-700">{profile?.bio || "No bio added yet."}</p>
              )}
            </div>
            {[
              { label: "LinkedIn",  name: "linkedIn",  icon: "💼", placeholder: "https://linkedin.com/in/yourname" },
              { label: "GitHub",    name: "github",    icon: "🐙", placeholder: "https://github.com/yourname" },
              { label: "Portfolio", name: "portfolio", icon: "🌐", placeholder: "https://yourportfolio.com" },
            ].map((link) => (
              <div key={link.name}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{link.icon} {link.label}</label>
                {editMode ? (
                  <input type="url" name={link.name} value={form[link.name]} onChange={handleChange}
                    className="input-field text-sm" placeholder={link.placeholder} />
                ) : profile?.[link.name] ? (
                  <a href={profile[link.name]} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline">{profile[link.name]}</a>
                ) : (
                  <p className="text-sm text-gray-400">Not added</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Placement & Mentorship */}
        <div className="card mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Placement & Mentorship</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Placement Status</label>
              {editMode ? (
                <select name="placementStatus" value={form.placementStatus} onChange={handleChange} className="input-field text-sm">
                  {PLACEMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              ) : (
                <span className={`badge ${statusObj?.color || "badge-gray"}`}>{statusObj?.label}</span>
              )}
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isAvailableForMentorship" checked={form.isAvailableForMentorship}
                onChange={handleChange} disabled={!editMode} className="accent-indigo-600 w-4 h-4" />
              <div>
                <p className="text-sm font-medium text-gray-700">Available for Mentorship</p>
                <p className="text-xs text-gray-400">Allow juniors to book mock interview sessions with you</p>
              </div>
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Member since {formatDate(user?.createdAt)} · HireLoop Campus Platform
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
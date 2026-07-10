import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getCompanies } from "../../services/companyService";
import { createExperience } from "../../services/experienceService";
import { BRANCHES, DIFFICULTY_LEVELS, EXPERIENCE_OUTCOMES, ROUND_TYPES } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const RESOURCES = ["LeetCode","GFG","Striver DSA","NeetCode","InterviewBit","HackerRank","Codeforces","YouTube","CLRS","Other"];

const DEFAULT_FORM = {
  companyId: "", role: "", year: currentYear, batch: "",
  branch: "", outcome: "", ctc: "", overallDifficulty: "Medium",
  summary: "", tips: "", resourcesUsed: [], isAnonymous: false,
  rounds: [],
};

const ExperienceForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [form, setForm]           = useState(DEFAULT_FORM);
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState(1); // 1=basics, 2=rounds, 3=tips

  useEffect(() => {
    getCompanies({ limit: 100 })
      .then((r) => setCompanies(r.data.data?.companies || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleResource = (r) => {
    setForm((p) => ({
      ...p,
      resourcesUsed: p.resourcesUsed.includes(r)
        ? p.resourcesUsed.filter((x) => x !== r)
        : [...p.resourcesUsed, r],
    }));
  };

  const addRound = () => {
    setForm((p) => ({
      ...p,
      rounds: [...p.rounds, { roundName: "Technical Interview", description: "", difficulty: "Medium", outcome: "Cleared" }],
    }));
  };

  const updateRound = (i, key, val) => {
    setForm((p) => {
      const rounds = [...p.rounds];
      rounds[i] = { ...rounds[i], [key]: val };
      return { ...p, rounds };
    });
  };

  const removeRound = (i) => {
    setForm((p) => ({ ...p, rounds: p.rounds.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async () => {
    if (!form.companyId)           return toast.error("Select a company");
    if (!form.role.trim())         return toast.error("Enter the job role");
    if (!form.outcome)             return toast.error("Select outcome");
    if (form.summary.length < 50)  return toast.error("Summary must be at least 50 characters");

    try {
      setLoading(true);
      const res = await createExperience(form);
      toast.success("Experience posted! 🎉 It will help many juniors.");
      if (onSuccess) onSuccess(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post experience");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Basic Info", "Round Details", "Tips & Submit"];

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Share Your Interview Experience</h2>
      <p className="text-sm text-gray-500 mb-6">Help juniors prepare better by sharing your journey</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"}`}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? "text-indigo-600" : "text-gray-400"}`}>{s}</span>
            {i < 2 && <div className={`flex-1 h-px ${step > i + 1 ? "bg-indigo-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
              <select name="companyId" value={form.companyId} onChange={handleChange} className="input-field">
                <option value="">Select company</option>
                {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
              <input type="text" name="role" value={form.role} onChange={handleChange}
                className="input-field" placeholder="Software Engineer" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year *</label>
              <select name="year" value={form.year} onChange={handleChange} className="input-field">
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch</label>
              <input type="number" name="batch" value={form.batch} onChange={handleChange}
                className="input-field" placeholder="2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Outcome *</label>
              <select name="outcome" value={form.outcome} onChange={handleChange} className="input-field">
                <option value="">Select</option>
                {EXPERIENCE_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
              <select name="overallDifficulty" value={form.overallDifficulty} onChange={handleChange} className="input-field">
                {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
              <select name="branch" value={form.branch} onChange={handleChange} className="input-field">
                <option value="">Select branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {form.outcome === "Selected" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CTC (LPA)</label>
                <input type="number" name="ctc" value={form.ctc} onChange={handleChange}
                  className="input-field" placeholder="e.g. 12.5" step="0.5" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Summary * <span className="text-gray-400 font-normal">({form.summary.length}/2000, min 50)</span>
            </label>
            <textarea name="summary" value={form.summary} onChange={handleChange}
              rows={5} className="input-field resize-none"
              placeholder="Describe your overall experience, how the process went, what to expect..." />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange}
              className="accent-indigo-600 w-4 h-4" />
            <span className="text-sm text-gray-600">Post anonymously (your name won't be shown)</span>
          </label>
        </div>
      )}

      {/* Step 2: Round Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Add details for each interview round (optional but helpful)</p>
            <button type="button" onClick={addRound} className="btn-secondary text-sm px-3 py-1.5">
              + Add Round
            </button>
          </div>

          {form.rounds.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <span className="text-3xl mb-2">📋</span>
              <p className="text-sm">No rounds added yet</p>
              <p className="text-xs mt-1">Click "Add Round" to describe each interview round</p>
            </div>
          ) : (
            form.rounds.map((round, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Round {i + 1}</span>
                  <button onClick={() => removeRound(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select value={round.roundName} onChange={(e) => updateRound(i, "roundName", e.target.value)} className="input-field text-sm">
                    {ROUND_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={round.difficulty} onChange={(e) => updateRound(i, "difficulty", e.target.value)} className="input-field text-sm">
                    {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={round.outcome} onChange={(e) => updateRound(i, "outcome", e.target.value)} className="input-field text-sm">
                    {["Cleared","Eliminated","Pending"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <textarea value={round.description} onChange={(e) => updateRound(i, "description", e.target.value)}
                  rows={2} className="input-field resize-none text-sm"
                  placeholder="What happened in this round? What questions were asked?" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Step 3: Tips & Submit */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tips for Juniors
            </label>
            <textarea name="tips" value={form.tips} onChange={handleChange}
              rows={4} className="input-field resize-none"
              placeholder="What would you do differently? What resources helped you? Any advice..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Resources Used</label>
            <div className="flex flex-wrap gap-2">
              {RESOURCES.map((r) => (
                <button key={r} type="button" onClick={() => toggleResource(r)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                    ${form.resourcesUsed.includes(r)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                    }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-1">
            <p className="font-semibold text-gray-700 mb-2">📋 Summary before posting</p>
            <p><span className="text-gray-400">Company:</span> {companies.find(c=>c._id===form.companyId)?.name || "—"}</p>
            <p><span className="text-gray-400">Role:</span> {form.role || "—"}</p>
            <p><span className="text-gray-400">Outcome:</span> {form.outcome || "—"}</p>
            <p><span className="text-gray-400">Rounds:</span> {form.rounds.length}</p>
            <p><span className="text-gray-400">Anonymous:</span> {form.isAnonymous ? "Yes" : "No"}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex-1">
            ← Back
          </button>
        )}
        {onCancel && step === 1 && (
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        )}
        {step < 3 ? (
          <button onClick={() => setStep((s) => s + 1)} className="btn-primary flex-1">
            Continue →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting...
              </span>
            ) : "Post Experience 🚀"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExperienceForm;
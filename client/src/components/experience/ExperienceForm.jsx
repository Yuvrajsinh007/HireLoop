import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getCompanies } from "../../services/companyService";
import { createExperience } from "../../services/experienceService";
import { BRANCHES, DIFFICULTY_LEVELS, EXPERIENCE_OUTCOMES, ROUND_TYPES } from "../../utils/constants";
import { useAuth } from '../../hooks/useAuth';
import { Check, ClipboardList, Loader2, Send, ArrowRight, ArrowLeft } from "lucide-react";

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
  const [step, setStep]           = useState(1);

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
      toast.success("Experience posted successfully!");
      if (onSuccess) onSuccess(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post experience");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Basic Info", "Round Details", "Submit"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-3xl mx-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <ClipboardList className="w-48 h-48 text-brand-600" />
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
        <p className="text-sm font-medium text-gray-500 mb-8">Help juniors prepare better by sharing your interview journey</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10 px-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm
                ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-brand-600 text-white scale-110" : "bg-gray-100 text-gray-400"}`}>
                {step > i + 1 ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${step === i + 1 ? "text-brand-700" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <div className={`flex-1 h-1 rounded-full transition-colors ${step > i + 1 ? "bg-emerald-400" : "bg-gray-100"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company <span className="text-red-500">*</span></label>
                <select name="companyId" value={form.companyId} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all">
                  <option value="">Select company</option>
                  {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                <input type="text" name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="Software Engineer" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year <span className="text-red-500">*</span></label>
                <select name="year" value={form.year} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all">
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Batch</label>
                <input type="number" name="batch" value={form.batch} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="2025" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Outcome <span className="text-red-500">*</span></label>
                <select name="outcome" value={form.outcome} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all">
                  <option value="">Select</option>
                  {EXPERIENCE_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulty</label>
                <select name="overallDifficulty" value={form.overallDifficulty} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all">
                  {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all">
                  <option value="">Select branch</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {form.outcome === "Selected" && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">CTC (LPA)</label>
                  <input type="number" name="ctc" value={form.ctc} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="e.g. 12.5" step="0.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Summary <span className="text-red-500">*</span></label>
                <span className={`text-xs font-bold ${form.summary.length < 50 ? "text-red-500" : "text-emerald-500"}`}>{form.summary.length}/2000 chars</span>
              </div>
              <textarea name="summary" value={form.summary} onChange={handleChange} rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none" placeholder="Describe your overall experience, how the process went, what to expect..." />
            </div>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange} className="peer w-5 h-5 appearance-none rounded-md border-2 border-gray-300 checked:bg-brand-600 checked:border-brand-600 transition-all" />
                <Check className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Post anonymously (your identity will be hidden)
              </span>
            </label>
          </div>
        )}

        {/* Step 2: Round Details */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-4 bg-brand-50 p-4 rounded-xl border border-brand-100">
              <p className="text-sm font-medium text-brand-800">Add details for specific interview rounds (optional but highly recommended)</p>
              <button type="button" onClick={addRound} className="bg-white text-brand-600 border border-brand-200 text-sm font-bold px-4 py-2 rounded-lg hover:bg-brand-50 shadow-sm transition-colors shrink-0">
                + Add Round
              </button>
            </div>

            {form.rounds.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-base font-bold text-gray-900 mb-1">No rounds added yet</p>
                <p className="text-sm font-medium">Click "Add Round" to describe the technical or HR rounds</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {form.rounds.map((round, i) => (
                  <div key={i} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-md">Round {i + 1}</span>
                      <button onClick={() => removeRound(i)} className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-wider transition-colors opacity-0 group-hover:opacity-100">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select value={round.roundName} onChange={(e) => updateRound(i, "roundName", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold text-gray-700">
                        {ROUND_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select value={round.difficulty} onChange={(e) => updateRound(i, "difficulty", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold text-gray-700">
                        {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select value={round.outcome} onChange={(e) => updateRound(i, "outcome", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold text-gray-700">
                        {["Cleared","Eliminated","Pending"].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <textarea value={round.description} onChange={(e) => updateRound(i, "description", e.target.value)} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none" placeholder="What happened in this round? What questions were asked?" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Tips & Submit */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tips for Juniors</label>
              <textarea name="tips" value={form.tips} onChange={handleChange} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none" placeholder="What would you do differently? Any advice..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Resources Used</label>
              <div className="flex flex-wrap gap-2.5">
                {RESOURCES.map((r) => (
                  <button key={r} type="button" onClick={() => toggleResource(r)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${form.resourcesUsed.includes(r) ? "bg-brand-600 text-white border-brand-600 shadow-md" : "bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-2">
              <p className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Summary before posting</p>
              <div className="grid grid-cols-2 gap-y-2">
                <p><span className="text-gray-400 font-medium">Company:</span> <span className="font-semibold text-gray-800">{companies.find(c=>c._id===form.companyId)?.name || "—"}</span></p>
                <p><span className="text-gray-400 font-medium">Role:</span> <span className="font-semibold text-gray-800">{form.role || "—"}</span></p>
                <p><span className="text-gray-400 font-medium">Outcome:</span> <span className="font-semibold text-emerald-600">{form.outcome || "—"}</span></p>
                <p><span className="text-gray-400 font-medium">Rounds:</span> <span className="font-semibold text-gray-800">{form.rounds.length} detailed</span></p>
                <p><span className="text-gray-400 font-medium">Anonymous:</span> <span className="font-semibold text-gray-800">{form.isAnonymous ? "Yes" : "No"}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {onCancel && step === 1 && (
            <button onClick={onCancel} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} className="flex-[2] bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-brand-500/20">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Post Experience</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceForm;
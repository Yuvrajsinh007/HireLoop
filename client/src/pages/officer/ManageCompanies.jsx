import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import { getCompanies, createCompany, updateCompany } from "../../services/companyService";
import { sendDriveAlert } from "../../services/officerService";
import { COMPANY_DOMAINS, ROUND_TYPES, BRANCHES } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "", website: "", domain: "Product", description: "",
  headquarters: "", minCGPA: 0, skillsRequired: [],
  eligibleBranches: [], driveStatus: "none",
  upcomingDriveDate: "", rounds: [],
};

const ManageCompanies = () => {
  const [companies, setCompanies]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [skillInput, setSkillInput]   = useState("");
  const [alertCompanyId, setAlertCompanyId] = useState("");
  const [alertDate, setAlertDate]     = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getCompanies({ limit: 50 });
      setCompanies(res.data.data?.companies || []);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const toggleBranch = (b) => {
    setForm((p) => ({
      ...p,
      eligibleBranches: p.eligibleBranches.includes(b)
        ? p.eligibleBranches.filter((x) => x !== b)
        : [...p.eligibleBranches, b],
    }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setForm((p) => ({ ...p, skillsRequired: [...new Set([...p.skillsRequired, skillInput.trim()])] }));
    setSkillInput("");
  };

  const removeSkill = (s) =>
    setForm((p) => ({ ...p, skillsRequired: p.skillsRequired.filter((x) => x !== s) }));

  const addRound = () =>
    setForm((p) => ({ ...p, rounds: [...p.rounds, { name: "Technical Interview", description: "", duration: "60 mins" }] }));

  const updateRound = (i, key, val) => {
    setForm((p) => {
      const rounds = [...p.rounds];
      rounds[i] = { ...rounds[i], [key]: val };
      return { ...p, rounds };
    });
  };

  const removeRound = (i) =>
    setForm((p) => ({ ...p, rounds: p.rounds.filter((_, idx) => idx !== i) }));

  const handleEdit = (company) => {
    setForm({
      name: company.name, website: company.website || "",
      domain: company.domain || "Product",
      description: company.description || "",
      headquarters: company.headquarters || "",
      minCGPA: company.minCGPA || 0,
      skillsRequired: company.skillsRequired || [],
      eligibleBranches: company.eligibleBranches || [],
      driveStatus: company.driveStatus || "none",
      upcomingDriveDate: company.upcomingDriveDate
        ? new Date(company.upcomingDriveDate).toISOString().split("T")[0]
        : "",
      rounds: company.rounds || [],
    });
    setEditingId(company._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Company name is required");
    try {
      setSaving(true);
      if (editingId) {
        const res = await updateCompany(editingId, form);
        setCompanies((p) => p.map((c) => c._id === editingId ? res.data.data : c));
        toast.success("Company updated ✅");
      } else {
        const res = await createCompany(form);
        setCompanies((p) => [res.data.data, ...p]);
        toast.success("Company added ✅");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save company");
    } finally {
      setSaving(false);
    }
  };

  const handleSendAlert = async () => {
    if (!alertCompanyId || !alertDate) return toast.error("Select company and drive date");
    try {
      setSendingAlert(true);
      const res = await sendDriveAlert({ companyId: alertCompanyId, driveDate: alertDate });
      toast.success(`Alert sent to ${res.data.data.sent} students! 📧`);
      setAlertCompanyId("");
      setAlertDate("");
    } catch {
      toast.error("Failed to send alert");
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title mb-1">Manage Companies 🏭</h1>
            <p className="text-sm text-gray-500">Add and manage campus recruitment companies</p>
          </div>
          <button
            onClick={() => { setShowForm((p) => !p); setEditingId(null); setForm(EMPTY_FORM); }}
            className={showForm && !editingId ? "btn-secondary" : "btn-primary"}
          >
            {showForm && !editingId ? "✕ Cancel" : "+ Add Company"}
          </button>
        </div>

        {/* Drive Alert Panel */}
        <div className="card mb-6 bg-indigo-50 border-indigo-100">
          <h3 className="font-semibold text-indigo-800 mb-3">📧 Send Drive Alert Email</h3>
          <p className="text-xs text-indigo-600 mb-3">Send placement drive notification to all eligible students via Brevo</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-indigo-700 mb-1">Company</label>
              <select value={alertCompanyId} onChange={(e) => setAlertCompanyId(e.target.value)} className="input-field text-sm">
                <option value="">Select company...</option>
                {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-indigo-700 mb-1">Drive Date</label>
              <input type="date" value={alertDate} onChange={(e) => setAlertDate(e.target.value)}
                className="input-field text-sm" min={new Date().toISOString().split("T")[0]} />
            </div>
            <button onClick={handleSendAlert} disabled={sendingAlert} className="btn-primary text-sm">
              {sendingAlert ? "Sending..." : "📧 Send Alert"}
            </button>
          </div>
        </div>

        {/* Company Form */}
        {showForm && (
          <div className="card mb-8">
            <h3 className="font-bold text-gray-800 mb-5">
              {editingId ? "✏️ Edit Company" : "➕ Add New Company"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company Name *</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    className="input-field" placeholder="TCS, Infosys, Google..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                  <input name="website" value={form.website} onChange={handleChange}
                    className="input-field" placeholder="https://company.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Domain</label>
                  <select name="domain" value={form.domain} onChange={handleChange} className="input-field">
                    {COMPANY_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Headquarters</label>
                  <input name="headquarters" value={form.headquarters} onChange={handleChange}
                    className="input-field" placeholder="Bengaluru, Mumbai..." />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={2} className="input-field resize-none" placeholder="About the company..." />
              </div>

              {/* Drive Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Drive Status</label>
                  <select name="driveStatus" value={form.driveStatus} onChange={handleChange} className="input-field">
                    {["none","upcoming","ongoing","completed"].map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Drive Date</label>
                  <input type="date" name="upcomingDriveDate" value={form.upcomingDriveDate}
                    onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min CGPA</label>
                  <input type="number" name="minCGPA" value={form.minCGPA} onChange={handleChange}
                    className="input-field" min="0" max="10" step="0.1" />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Required Skills</label>
                <div className="flex gap-2 mb-2">
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="input-field text-sm flex-1" placeholder="Type skill and press Enter" />
                  <button type="button" onClick={addSkill} className="btn-secondary text-sm px-3">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.skillsRequired.map((s) => (
                    <span key={s} className="badge badge-indigo text-xs flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="text-indigo-400 hover:text-indigo-700">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Eligible Branches */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Eligible Branches</label>
                <div className="flex flex-wrap gap-2">
                  {BRANCHES.map((b) => (
                    <button key={b} type="button" onClick={() => toggleBranch(b)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                        ${form.eligibleBranches.includes(b)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounds */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-600">Interview Rounds</label>
                  <button type="button" onClick={addRound} className="text-xs text-indigo-600 hover:underline">+ Add Round</button>
                </div>
                <div className="space-y-2">
                  {form.rounds.map((round, i) => (
                    <div key={i} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
                      <select value={round.name} onChange={(e) => updateRound(i, "name", e.target.value)}
                        className="input-field text-sm flex-1">
                        {ROUND_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <input value={round.duration} onChange={(e) => updateRound(i, "duration", e.target.value)}
                        className="input-field text-sm w-24" placeholder="60 mins" />
                      <button type="button" onClick={() => removeRound(i)} className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
                  className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? "Saving..." : editingId ? "Update Company" : "Add Company"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Companies List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-64"><Loader size="lg" /></div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-medium text-gray-600">{companies.length} companies</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Company","Domain","Drive Status","Drive Date","Min CGPA","Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {companies.map((company) => (
                    <tr key={company._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {company.name?.[0]}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{company.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{company.domain}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs capitalize ${
                          company.driveStatus === "upcoming"  ? "badge-indigo" :
                          company.driveStatus === "ongoing"   ? "badge-green"  :
                          company.driveStatus === "completed" ? "badge-gray"   : "badge-gray"
                        }`}>{company.driveStatus}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {company.upcomingDriveDate ? formatDate(company.upcomingDriveDate) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{company.minCGPA || "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleEdit(company)}
                          className="text-xs text-indigo-600 hover:underline font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageCompanies;
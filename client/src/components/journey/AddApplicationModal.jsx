import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getCompanies } from "../../services/companyService";
import { addApplication } from "../../services/studentService";
import { X, Search, Loader2, Building2, Check } from "lucide-react";

const AddApplicationModal = ({ onClose, onAdded }) => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    companyId: "",
    role: "",
    notes: "",
    applyDate: new Date().toISOString().split("T")[0],
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await getCompanies({ limit: 100 });
        setCompanies(res.data.data?.companies || []);
      } catch {
        toast.error("Failed to load companies");
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyId) return toast.error("Please select a company");
    if (!form.role.trim()) return toast.error("Please enter the job role");
    try {
      setLoading(true);
      const res = await addApplication(form);
      toast.success("Application added successfully!");
      onAdded(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Add Application</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Company Search & Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Company <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            
            {loadingCompanies ? (
              <div className="flex items-center justify-center py-4 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-40 overflow-y-auto custom-scrollbar">
                {filtered.length === 0 ? (
                  <div className="p-3 text-sm text-center text-gray-400 font-medium">No companies found</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filtered.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, companyId: c._id }))}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left
                          ${form.companyId === c._id ? "bg-brand-50 text-brand-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 ${form.companyId === c._id ? "text-brand-600" : "text-gray-400"}`} />
                          <span>{c.name} {c.domain && <span className="text-xs text-gray-400 ml-1">({c.domain})</span>}</span>
                        </div>
                        {form.companyId === c._id && <Check className="w-4 h-4 text-brand-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Job Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="e.g. Software Engineer, Full Stack Developer"
            />
          </div>

          {/* Apply Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Applied On
            </label>
            <input
              type="date"
              name="applyDate"
              value={form.applyDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-700"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              placeholder="Any notes about this application..."
            />
          </div>

          {/* Private toggle */}
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                name="isPrivate"
                checked={form.isPrivate}
                onChange={handleChange}
                className="peer w-5 h-5 appearance-none rounded-md border-2 border-gray-300 checked:bg-brand-600 checked:border-brand-600 transition-all"
              />
              <Check className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              Keep this application private (only visible to me)
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-brand-600 text-white font-medium py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplicationModal;
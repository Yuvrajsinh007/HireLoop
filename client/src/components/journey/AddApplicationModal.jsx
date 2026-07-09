import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getCompanies } from "../../services/companyService";
import { addApplication } from "../../services/studentService";

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
      toast.success("Application added! 🎉");
      onAdded(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Application</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Company Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field mb-2"
            />
            {loadingCompanies ? (
              <div className="text-sm text-gray-400 text-center py-2">Loading companies...</div>
            ) : (
              <select
                name="companyId"
                value={form.companyId}
                onChange={handleChange}
                className="input-field"
                size={4}
              >
                <option value="">-- Select a company --</option>
                {filtered.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.domain ? `(${c.domain})` : ""}
                  </option>
                ))}
              </select>
            )}
            {form.companyId && (
              <p className="text-xs text-indigo-600 mt-1">
                ✓ Selected: {companies.find((c) => c._id === form.companyId)?.name}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Software Engineer, Full Stack Developer"
            />
          </div>

          {/* Apply Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Applied On
            </label>
            <input
              type="date"
              name="applyDate"
              value={form.applyDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
              placeholder="Any notes about this application..."
            />
          </div>

          {/* Private toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isPrivate"
              checked={form.isPrivate}
              onChange={handleChange}
              className="accent-indigo-600 w-4 h-4"
            />
            <span className="text-sm text-gray-600">
              Keep this application private (only visible to me)
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplicationModal;
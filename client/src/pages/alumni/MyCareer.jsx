import { useState, useEffect } from "react";
import Loader from "../../components/common/Loader";
import {
  getEmploymentHistory,
  addEmployment,
  updateEmployment,
  deleteEmployment,
} from "../../services/memberService";
import { formatDate } from "../../utils/formatDate";
import { EMPLOYMENT_TYPES } from "../../utils/constants";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  companyName: "",
  jobTitle: "",
  employmentType: "Full-Time",
  ctc: "",
  stipend: "",
  startDate: "",
  endDate: "",
  isCurrent: true,
  isViaCampus: false,
  description: "",
};

const MyCareer = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getEmploymentHistory();
      setHistory(res.data.data || []);
    } catch {
      toast.error("Failed to load employment history");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (entry) => {
    setEditId(entry._id);

    setForm({
      companyName: entry.companyName || "",
      jobTitle: entry.jobTitle || "",
      employmentType: entry.employmentType || "Full-Time",
      ctc: entry.ctc || "",
      stipend: entry.stipend || "",
      startDate: entry.startDate
        ? new Date(entry.startDate).toISOString().split("T")[0]
        : "",
      endDate: entry.endDate
        ? new Date(entry.endDate).toISOString().split("T")[0]
        : "",
      isCurrent: entry.isCurrent || false,
      isViaCampus: entry.isViaCampus || false,
      description: entry.description || "",
    });

    setShowForm(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName.trim()) {
      return toast.error("Company name is required");
    }

    try {
      setSaving(true);

      if (editId) {
        const res = await updateEmployment(editId, form);

        setHistory((prev) =>
          prev.map((item) =>
            item._id === editId ? res.data.data : item
          )
        );

        toast.success("Employment updated ✅");
      } else {
        const res = await addEmployment(form);

        setHistory((prev) => [res.data.data, ...prev]);

        toast.success("Employment added ✅");
      }

      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employment record?")) {
      return;
    }

    try {
      await deleteEmployment(id);

      setHistory((prev) =>
        prev.filter((item) => item._id !== id)
      );

      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" text="Loading career history..." />
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-1">
            My Career 💼
          </h1>

          <p className="text-sm text-gray-500">
            Your employment timeline and career progression
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((prev) => !prev);
            setEditId(null);
            setForm(EMPTY_FORM);
          }}
          className={
            showForm && !editId
              ? "btn-secondary"
              : "btn-primary"
          }
        >
          {showForm && !editId
            ? "✕ Cancel"
            : "+ Add Employment"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8">
          <h3 className="font-bold text-gray-800 mb-5">
            {editId
              ? "✏️ Edit Employment"
              : "➕ Add Employment"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Company Name *
                </label>

                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Google, TCS, Infosys..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Job Title
                </label>

                <input
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Software Engineer, SDE-1..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Employment Type
                </label>

                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  className="input-field"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {form.employmentType === "Intern"
                    ? "Stipend (₹/month)"
                    : "CTC (LPA)"}
                </label>

                <input
                  name={
                    form.employmentType === "Intern"
                      ? "stipend"
                      : "ctc"
                  }
                  value={
                    form.employmentType === "Intern"
                      ? form.stipend
                      : form.ctc
                  }
                  onChange={handleChange}
                  type="number"
                  step="0.5"
                  className="input-field"
                  placeholder="e.g. 12.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  disabled={form.isCurrent}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="input-field resize-none"
                placeholder="Brief description of your role..."
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  name="isCurrent"
                  checked={form.isCurrent}
                  onChange={handleChange}
                  className="accent-indigo-600 w-4 h-4"
                />
                Currently working here
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  name="isViaCampus"
                  checked={form.isViaCampus}
                  onChange={handleChange}
                  className="accent-indigo-600 w-4 h-4"
                />
                Obtained via campus placement
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm(EMPTY_FORM);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving
                  ? "Saving..."
                  : editId
                  ? "Update"
                  : "Add Employment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline */}
      {history.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-5xl mb-4">💼</div>

          <p className="text-lg font-medium text-gray-500">
            No employment history yet
          </p>

          <p className="text-sm mt-1">
            Add your first job or internship
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry._id}
              className={`card ${
                entry.isCurrent
                  ? "border-indigo-200 bg-indigo-50/30"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base flex-shrink-0">
                    {entry.companyName?.[0]?.toUpperCase() ||
                      "?"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">
                        {entry.companyName}
                      </h3>

                      {entry.isCurrent && (
                        <span className="badge badge-green text-xs">
                          Current
                        </span>
                      )}

                      {entry.isViaCampus && (
                        <span className="badge badge-indigo text-xs">
                          Campus
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-0.5">
                      {entry.jobTitle || "—"}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                      <span>{entry.employmentType}</span>

                      {(entry.ctc || entry.stipend) && (
                        <span className="text-green-600 font-semibold">
                          {entry.ctc
                            ? `${entry.ctc} LPA`
                            : `₹${entry.stipend}/mo`}
                        </span>
                      )}

                      <span>
                        {entry.startDate
                          ? formatDate(entry.startDate)
                          : "—"}{" "}
                        →{" "}
                        {entry.isCurrent
                          ? "Present"
                          : entry.endDate
                          ? formatDate(entry.endDate)
                          : "—"}
                      </span>
                    </div>

                    {entry.description && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(entry._id)
                    }
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCareer;
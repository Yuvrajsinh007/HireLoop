import { useState, useEffect } from "react";
import Loader from "../../components/common/Loader";
import {
  getDrives,
  createDrive,
  updateDrive,
  sendDriveAlert,
} from "../../services/driveService";
import { searchCompanies } from "../../services/companyService";
import { getPrograms } from "../../services/institutionService";
import {
  DRIVE_TYPES,
  ROUND_TYPES,
} from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  company: "",
  title: "",
  driveType: "ON_CAMPUS",
  academicYear: "",
  driveDate: "",
  applicationDeadline: "",
  minCGPA: 0,
  maxBacklogs: 0,
  eligiblePrograms: [],
  graduationYears: [],
  eligibilityCriteria: "",
  roles: [],
  rounds: [],
  skillsRequired: [],
  description: "",
};

const STATUS_COLORS = {
  UPCOMING: "badge-indigo",
  ACTIVE: "badge-green",
  COMPLETED: "badge-gray",
  CANCELLED: "badge-red",
};

const ManageDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [companies, setCompanies] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [alertId, setAlertId] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    fetchDrives();
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (companySearch.length < 2) {
      setCompanies([]);
      return;
    }

    const t = setTimeout(async () => {
      const res = await searchCompanies(companySearch).catch(
        () => null
      );

      if (res) {
        setCompanies(res.data.data || []);
        setShowDrop(true);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [companySearch]);

  const fetchDrives = async () => {
    try {
      setLoading(true);

      const res = await getDrives({ limit: 50 });

      setDrives(res.data.data?.drives || []);
    } catch {
      toast.error("Failed to load drives");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    const res = await getPrograms().catch(() => null);

    if (res) {
      setPrograms(res.data.data || []);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleProgram = (id) =>
    setForm((prev) => ({
      ...prev,
      eligiblePrograms: prev.eligiblePrograms.includes(id)
        ? prev.eligiblePrograms.filter((x) => x !== id)
        : [...prev.eligiblePrograms, id],
    }));

  const addRound = () =>
    setForm((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          name: "Technical Interview",
          description: "",
          duration: "60 mins",
        },
      ],
    }));

  const updateRound = (index, key, value) =>
    setForm((prev) => {
      const rounds = [...prev.rounds];

      rounds[index] = {
        ...rounds[index],
        [key]: value,
      };

      return {
        ...prev,
        rounds,
      };
    });

  const addRole = () =>
    setForm((prev) => ({
      ...prev,
      roles: [
        ...prev.roles,
        {
          title: "",
          employmentType: "Full-Time",
          ctcTotal: "",
          openings: "",
          location: "",
        },
      ],
    }));

  const updateRole = (index, key, value) =>
    setForm((prev) => {
      const roles = [...prev.roles];

      roles[index] = {
        ...roles[index],
        [key]: value,
      };

      return {
        ...prev,
        roles,
      };
    });

  const addSkill = () => {
    if (!skillInput.trim()) return;

    setForm((prev) => ({
      ...prev,
      skillsRequired: [
        ...new Set([
          ...prev.skillsRequired,
          skillInput.trim(),
        ]),
      ],
    }));

    setSkillInput("");
  };

  const handleEdit = (drive) => {
    setEditId(drive._id);

    setForm({
      company: drive.company?._id || "",
      title: drive.title || "",
      driveType: drive.driveType || "ON_CAMPUS",
      academicYear: drive.academicYear || "",
      driveDate: drive.driveDate
        ? new Date(drive.driveDate)
            .toISOString()
            .split("T")[0]
        : "",
      applicationDeadline: drive.applicationDeadline
        ? new Date(drive.applicationDeadline)
            .toISOString()
            .split("T")[0]
        : "",
      minCGPA: drive.minCGPA || 0,
      maxBacklogs: drive.maxBacklogs || 0,
      eligiblePrograms:
        drive.eligiblePrograms?.map(
          (program) => program._id || program
        ) || [],
      graduationYears: drive.graduationYears || [],
      eligibilityCriteria:
        drive.eligibilityCriteria || "",
      roles: drive.roles || [],
      rounds: drive.rounds || [],
      skillsRequired:
        drive.skillsRequired || [],
      description: drive.description || "",
    });

    setCompanySearch(drive.company?.name || "");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company || !form.title) {
      return toast.error(
        "Company and title are required"
      );
    }

    try {
      setSaving(true);

      if (editId) {
        const res = await updateDrive(
          editId,
          form
        );

        setDrives((prev) =>
          prev.map((drive) =>
            drive._id === editId
              ? res.data.data
              : drive
          )
        );

        toast.success("Drive updated ✅");
      } else {
        const res = await createDrive(form);

        setDrives((prev) => [
          res.data.data,
          ...prev,
        ]);

        toast.success("Drive created ✅");
      }

      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSendAlert = async () => {
    if (!alertId) {
      return toast.error("Select a drive first");
    }

    try {
      setSendingAlert(true);

      const res = await sendDriveAlert(alertId);

      toast.success(
        `Alert sent to ${res.data.data.sent} students! 📧`
      );

      setAlertId("");
    } catch {
      toast.error("Failed to send alert");
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title mb-1">
            Manage Drives 🚀
          </h1>

          <p className="text-sm text-gray-500">
            Create and manage placement drives
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((prev) => !prev);
            setEditId(null);
            setForm(EMPTY_FORM);
            setCompanySearch("");
          }}
          className={
            showForm && !editId
              ? "btn-secondary"
              : "btn-primary"
          }
        >
          {showForm && !editId
            ? "✕ Cancel"
            : "+ Create Drive"}
        </button>
      </div>

      {/* Alert Panel */}
      <div className="card mb-6 bg-indigo-50 border-indigo-100">
        <h3 className="font-semibold text-indigo-800 mb-3">
          📧 Send Drive Alert
        </h3>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-indigo-700 mb-1">
              Select Drive
            </label>

            <select
              value={alertId}
              onChange={(e) =>
                setAlertId(e.target.value)
              }
              className="input-field text-sm"
            >
              <option value="">
                Select a drive...
              </option>

              {drives
                .filter(
                  (drive) =>
                    drive.status !== "COMPLETED"
                )
                .map((drive) => (
                  <option
                    key={drive._id}
                    value={drive._id}
                  >
                    {drive.company?.name} —{" "}
                    {drive.title}
                  </option>
                ))}
            </select>
          </div>

          <button
            onClick={handleSendAlert}
            disabled={sendingAlert}
            className="btn-primary text-sm"
          >
            {sendingAlert
              ? "Sending..."
              : "📧 Send Alert"}
          </button>
        </div>
      </div>

      {/* Drive Form */}
      {showForm && (
        <div className="card mb-8">
          <h3 className="font-bold text-gray-800 mb-5">
            {editId
              ? "✏️ Edit Drive"
              : "➕ Create Drive"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Company */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Company *
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(
                      e.target.value
                    );

                    setForm((prev) => ({
                      ...prev,
                      company: "",
                    }));
                  }}
                  className="input-field"
                  placeholder="Search company..."
                />

                {showDrop &&
                  companies.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 overflow-hidden">
                      {companies.map(
                        (company) => (
                          <button
                            key={company._id}
                            type="button"
                            onClick={() => {
                              setForm(
                                (prev) => ({
                                  ...prev,
                                  company:
                                    company._id,
                                })
                              );

                              setCompanySearch(
                                company.name
                              );

                              setShowDrop(
                                false
                              );
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-left text-sm"
                          >
                            <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {
                                company.name?.[0]
                              }
                            </div>

                            {company.name}
                          </button>
                        )
                      )}
                    </div>
                  )}
              </div>

              {form.company && (
                <p className="text-xs text-indigo-600 mt-1">
                  ✓ {companySearch}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title *
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Campus Drive 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Drive Type
                </label>

                <select
                  name="driveType"
                  value={form.driveType}
                  onChange={handleChange}
                  className="input-field"
                >
                  {DRIVE_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Drive Date
                </label>

                <input
                  type="date"
                  name="driveDate"
                  value={form.driveDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Application Deadline
                </label>

                <input
                  type="date"
                  name="applicationDeadline"
                  value={
                    form.applicationDeadline
                  }
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Min CGPA
                </label>

                <input
                  type="number"
                  name="minCGPA"
                  value={form.minCGPA}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Max Backlogs Allowed
                </label>

                <input
                  type="number"
                  name="maxBacklogs"
                  value={form.maxBacklogs}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            {/* Eligible Programs */}
            {programs.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Eligible Programs (leave empty = all)
                </label>

                <div className="flex flex-wrap gap-2">
                  {programs.map((program) => (
                    <button
                      key={program._id}
                      type="button"
                      onClick={() =>
                        toggleProgram(
                          program._id
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        form.eligiblePrograms.includes(
                          program._id
                        )
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-500 hover:border-indigo-300"
                      }`}
                    >
                      {program.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Required Skills
              </label>

              <div className="flex gap-2 mb-2">
                <input
                  value={skillInput}
                  onChange={(e) =>
                    setSkillInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    addSkill())
                  }
                  className="input-field text-sm flex-1"
                  placeholder="Type skill and press Enter"
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-secondary text-sm px-3"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {form.skillsRequired.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="badge badge-indigo text-xs flex items-center gap-1"
                    >
                      {skill}

                      <button
                        type="button"
                        onClick={() =>
                          setForm(
                            (prev) => ({
                              ...prev,
                              skillsRequired:
                                prev.skillsRequired.filter(
                                  (
                                    item
                                  ) =>
                                    item !==
                                    skill
                                ),
                            })
                          )
                        }
                        className="ml-1 text-indigo-400 hover:text-indigo-700"
                      >
                        ✕
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Roles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-600">
                  Job Roles
                </label>

                <button
                  type="button"
                  onClick={addRole}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Add Role
                </button>
              </div>

              <div className="space-y-2">
                {form.roles.map(
                  (role, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <input
                        value={role.title}
                        onChange={(e) =>
                          updateRole(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        className="input-field text-sm flex-1"
                        placeholder="Role title"
                      />

                      <input
                        type="number"
                        value={role.ctcTotal}
                        onChange={(e) =>
                          updateRole(
                            index,
                            "ctcTotal",
                            e.target.value
                          )
                        }
                        className="input-field text-sm w-24"
                        placeholder="CTC"
                        step="0.5"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setForm(
                            (prev) => ({
                              ...prev,
                              roles:
                                prev.roles.filter(
                                  (
                                    _,
                                    idx
                                  ) =>
                                    idx !==
                                    index
                                ),
                            })
                          )
                        }
                        className="text-red-400 hover:text-red-600 text-sm flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Rounds */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-600">
                  Interview Rounds
                </label>

                <button
                  type="button"
                  onClick={addRound}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Add Round
                </button>
              </div>

              <div className="space-y-2">
                {form.rounds.map(
                  (round, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <select
                        value={round.name}
                        onChange={(e) =>
                          updateRound(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        className="input-field text-sm flex-1"
                      >
                        {ROUND_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>

                      <input
                        value={round.duration}
                        onChange={(e) =>
                          updateRound(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        className="input-field text-sm w-24"
                        placeholder="Duration"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setForm(
                            (prev) => ({
                              ...prev,
                              rounds:
                                prev.rounds.filter(
                                  (
                                    _,
                                    idx
                                  ) =>
                                    idx !==
                                    index
                                ),
                            })
                          )
                        }
                        className="text-red-400 hover:text-red-600 text-sm flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  )
                )}
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
                placeholder="About this drive..."
              />
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
                  ? "Update Drive"
                  : "Create Drive"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drives List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-600">
              {drives.length} drives
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Company",
                    "Title",
                    "Type",
                    "Date",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="text-left text-xs font-semibold text-gray-500 px-5 py-3"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {drives.map((drive) => (
                  <tr
                    key={drive._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {drive.company?.name?.[0] ||
                            "?"}
                        </div>

                        <span className="text-sm font-medium text-gray-800">
                          {drive.company?.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {drive.title}
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-500">
                      {
                        DRIVE_TYPES.find(
                          (type) =>
                            type.value ===
                            drive.driveType
                        )?.label
                      }
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-500">
                      {drive.driveDate
                        ? formatDate(
                            drive.driveDate
                          )
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`badge text-xs ${
                          STATUS_COLORS[
                            drive.status
                          ] || "badge-gray"
                        }`}
                      >
                        {drive.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleEdit(drive)
                        }
                        className="text-xs text-indigo-600 hover:underline font-medium"
                      >
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
  );
};

export default ManageDrives;
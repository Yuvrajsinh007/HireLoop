import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import KanbanBoard from "../../components/journey/KanbanBoard";
import AddApplicationModal from "../../components/journey/AddApplicationModal";
import StageUpdateModal from "../../components/journey/StageUpdateModal";
import Loader from "../../components/common/Loader";
import { getMyApplications, deleteApplication } from "../../services/studentService";
import { STAGE_COLORS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const FILTER_OPTIONS = [
  { label: "All",      value: "all"      },
  { label: "Active",   value: "active"   },
  { label: "Offers",   value: "offers"   },
  { label: "Rejected", value: "rejected" },
];

const ACTIVE_STAGES   = ["Shortlisted","Aptitude Test","Coding Test","Group Discussion","Technical Interview","HR Interview","Management Round"];
const OFFER_STAGES    = ["Offer Received","Joined"];
const REJECTED_STAGES = ["Rejected","On Hold","Withdrew"];

const JourneyTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView]                 = useState("kanban");
  const [filter, setFilter]             = useState("all");
  const [search, setSearch]             = useState("");

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getMyApplications();
      setApplications(res.data.data?.applications || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdated = (updated) =>
    setApplications((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));

  const handleDeleted = (id) =>
    setApplications((prev) => prev.filter((a) => a._id !== id));

  const handleAdded = (newApp) =>
    setApplications((prev) => [newApp, ...prev]);

  const filtered = applications.filter((app) => {
    const matchSearch =
      app.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.role?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "active")   return ACTIVE_STAGES.includes(app.currentStage);
    if (filter === "offers")   return OFFER_STAGES.includes(app.currentStage);
    if (filter === "rejected") return REJECTED_STAGES.includes(app.currentStage);
    return true;
  });

  const total    = applications.length;
  const active   = applications.filter((a) => ACTIVE_STAGES.includes(a.currentStage)).length;
  const offers   = applications.filter((a) => OFFER_STAGES.includes(a.currentStage)).length;
  const rejected = applications.filter((a) => REJECTED_STAGES.includes(a.currentStage)).length;

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title mb-1">My Journey Tracker</h1>
            <p className="text-sm text-gray-500">Track every placement application in one place</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <span>+</span> Add Application
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total",    value: total,    color: "text-gray-800",   bg: "bg-gray-50 border-gray-200"     },
            { label: "Active",   value: active,   color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
            { label: "Offers",   value: offers,   color: "text-green-700",  bg: "bg-green-50 border-green-200"   },
            { label: "Rejected", value: rejected, color: "text-red-600",    bg: "bg-red-50 border-red-200"       },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role..."
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${filter === f.value ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${view === "kanban" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}
            >
              📋 Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${view === "list" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}
            >
              📄 List
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader size="lg" text="Loading your applications..." />
          </div>
        ) : view === "kanban" ? (
          <KanbanBoard
            applications={filtered}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        ) : (
          <ListView
            applications={filtered}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        )}
      </div>

      {showAddModal && (
        <AddApplicationModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}
    </DashboardLayout>
  );
};

/* ── List View ───────────────────────────────────────────────────────────── */
const ListView = ({ applications, onUpdated, onDeleted }) => {
  const [stageApp, setStageApp] = useState(null);

  if (applications.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm">No applications found</p>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Company","Role","Stage","Applied","CTC","Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                        {app.company?.name?.[0] || "?"}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{app.company?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{app.role}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STAGE_COLORS[app.currentStage] || "badge-gray"}`}>
                      {app.currentStage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(app.applyDate)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {app.ctcOffered ? `${app.ctcOffered} LPA` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setStageApp(app)}
                        className="text-xs text-indigo-600 hover:underline font-medium"
                      >
                        Update
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm("Remove this application?")) return;
                          try {
                            await deleteApplication(app._id);
                            onDeleted(app._id);
                            toast.success("Removed");
                          } catch {
                            toast.error("Failed to delete");
                          }
                        }}
                        className="text-xs text-red-500 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stageApp && (
        <StageUpdateModal
          application={stageApp}
          onClose={() => setStageApp(null)}
          onUpdated={(updated) => { onUpdated(updated); setStageApp(null); }}
        />
      )}
    </>
  );
};

export default JourneyTracker;
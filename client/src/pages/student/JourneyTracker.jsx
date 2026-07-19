import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import KanbanBoard from "../../components/journey/KanbanBoard";
import AddApplicationModal from "../../components/journey/AddApplicationModal";
import StageUpdateModal from "../../components/journey/StageUpdateModal";
import Loader from "../../components/common/Loader";
import { getMyApplications, deleteApplication } from "../../services/memberService"; // Or applicationService depending on your structure
import { STAGE_COLORS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { Search, Plus, LayoutGrid, List as ListIcon, Inbox, Pencil, Trash2, Building2 } from "lucide-react";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">My Journey Tracker</h1>
            <p className="text-sm font-medium text-gray-500">Manage and track every placement application in real-time</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-indigo-600 text-white font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </motion.div>

        {/* Stats Strip */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total",    value: total,    color: "text-gray-900",  bg: "bg-white border-gray-200"  },
            { label: "Active",   value: active,   color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
            { label: "Offers",   value: offers,   color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "Rejected", value: rejected, color: "text-red-700",   bg: "bg-red-50 border-red-200"   },
          ].map((s) => (
            <motion.div 
              key={s.label} 
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${s.bg}`}
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Toolbar */}
        <motion.div variants={itemVariants} className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-1">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200
                    ${filter === f.value ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 border border-transparent"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("kanban")}
                className={`p-1.5 rounded-md transition-all duration-200
                  ${view === "kanban" ? "bg-white text-indigo-600 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-900 border border-transparent"}`}
                title="Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-all duration-200
                  ${view === "list" ? "bg-white text-indigo-600 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-900 border border-transparent"}`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="min-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader text="Fetching your applications..." />
            </div>
          ) : view === "kanban" ? (
            <AnimatePresence mode="wait">
              <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <KanbanBoard
                  applications={filtered}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ListView
                  applications={filtered}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <AddApplicationModal
            onClose={() => setShowAddModal(false)}
            onAdded={handleAdded}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

/* ── List View ───────────────────────────────────────────────────────────── */
const ListView = ({ applications, onUpdated, onDeleted }) => {
  const [stageApp, setStageApp] = useState(null);

  if (applications.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400 shadow-sm"
      >
        <Inbox className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium text-gray-500">No applications found matching your criteria</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Company","Role","Current Stage","Applied On","CTC","Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {applications.map((app) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    key={app._id} 
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0 shadow-sm">
                          {app.company?.name ? app.company.name[0].toUpperCase() : <Building2 className="w-4 h-4 stroke-[1.5]" />}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{app.company?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{app.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${STAGE_COLORS[app.currentStage] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {app.currentStage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{formatDate(app.applyDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {app.ctcOffered ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md font-semibold">{app.ctcOffered} LPA</span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setStageApp(app)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Update Stage"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Are you sure you want to remove your application for ${app.company?.name}?`)) return;
                            try {
                              await deleteApplication(app._id);
                              onDeleted(app._id);
                              toast.success("Application removed");
                            } catch {
                              toast.error("Failed to delete application");
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {stageApp && (
          <StageUpdateModal
            application={stageApp}
            onClose={() => setStageApp(null)}
            onUpdated={(updated) => { onUpdated(updated); setStageApp(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default JourneyTracker;
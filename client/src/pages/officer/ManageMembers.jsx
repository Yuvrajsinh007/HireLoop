import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";
import { 
  Users, Search, Filter, Edit2, GraduationCap, 
  X, Loader2, CheckCircle2, ChevronRight
} from "lucide-react";
import { getMembers, updateMemberStatus, graduateBatch } from "../../services/officerService"; 
import { formatDate } from "../../utils/formatDate";

const ACADEMIC_STATUSES = ["ENROLLED", "FINAL_YEAR", "GRADUATED", "NOT_APPLICABLE"];
const PLACEMENT_STATUSES = ["UNPLACED", "SEARCHING", "PLACED", "HIGHER_STUDIES", "NOT_PARTICIPATING", "NOT_APPLICABLE"];

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    academicStatus: "",
    placementStatus: "",
  });

  // Modal States
  const [editingMember, setEditingMember] = useState(null);
  const [showGraduateModal, setShowGraduateModal] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchMembers();
  }, [page, debouncedSearch, filters]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 15,
        search: debouncedSearch,
        ...filters
      };
      
      const res = await getMembers(params);
      setMembers(res.data.data?.members || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Manage Members</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Directory of all students and alumni registered within your institution.
            </p>
          </div>
          
          <button 
            onClick={() => setShowGraduateModal(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <GraduationCap className="w-4 h-4 mr-2" /> Graduate Batch
          </button>
        </motion.div>

        {/* Toolbar: Search & Filters */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Filter className="w-4 h-4" />
              </span>
              <select
                name="academicStatus"
                value={filters.academicStatus}
                onChange={handleFilterChange}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">All Academic Status</option>
                {ACADEMIC_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            
            <div className="relative w-full sm:w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Filter className="w-4 h-4" />
              </span>
              <select
                name="placementStatus"
                value={filters.placementStatus}
                onChange={handleFilterChange}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">All Placement Status</option>
                {PLACEMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Content Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] flex flex-col">
          {loading && members.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader text="Fetching institution members..." />
            </div>
          ) : members.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Members Found</h3>
              <p className="text-sm font-medium text-gray-500">
                No users match your current search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {["Member", "Program Details", "Academic Status", "Placement Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {members.map((profile) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={profile._id} 
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar src={profile.user?.avatar} name={profile.user?.name} size="md" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{profile.user?.name || "Unknown"}</p>
                              <p className="text-xs font-medium text-gray-500">{profile.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-800">{profile.program?.name || "—"}</p>
                          <p className="text-xs font-medium text-gray-500">
                            {profile.rollNumber || "No Roll No."} • Batch of {profile.graduationYear || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${
                            profile.user?.academicStatus === 'GRADUATED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            profile.user?.academicStatus === 'FINAL_YEAR' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {profile.user?.academicStatus?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${
                            profile.user?.placementStatus === 'PLACED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            profile.user?.placementStatus === 'SEARCHING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {profile.user?.placementStatus?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setEditingMember(profile)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Status
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-4 mt-auto">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white shadow-sm disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white shadow-sm disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Edit Status Modal */}
      <AnimatePresence>
        {editingMember && (
          <EditStatusModal 
            profile={editingMember} 
            onClose={() => setEditingMember(null)}
            onSuccess={() => {
              setEditingMember(null);
              fetchMembers();
            }}
          />
        )}
      </AnimatePresence>

      {/* Graduate Batch Modal */}
      <AnimatePresence>
        {showGraduateModal && (
          <GraduateBatchModal 
            onClose={() => setShowGraduateModal(false)}
            onSuccess={() => {
              setShowGraduateModal(false);
              fetchMembers();
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

/* ── Modal: Edit Member Status ───────────────────────────────────────────── */
const EditStatusModal = ({ profile, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setForm] = useState({
    academicStatus: profile.user?.academicStatus || "",
    placementStatus: profile.user?.placementStatus || "",
    employmentStatus: profile.user?.employmentStatus || "",
  });

  const handleChange = (e) => setForm({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateMemberStatus(profile.user._id, formData);
      toast.success("Member status updated successfully");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Update Member Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-2">
            <Avatar src={profile.user?.avatar} name={profile.user?.name} size="md" />
            <div>
              <p className="text-sm font-bold text-indigo-900">{profile.user?.name}</p>
              <p className="text-xs font-medium text-indigo-700">{profile.program?.name || "No Program"}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Academic Status</label>
            <select name="academicStatus" value={formData.academicStatus} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              {ACADEMIC_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Placement Status</label>
            <select name="placementStatus" value={formData.placementStatus} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              {PLACEMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Status</label>
            <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              {["STUDENT", "INTERN", "WORKING", "SEEKING", "HIGHER_STUDIES", "NOT_APPLICABLE"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ── Modal: Graduate Batch ───────────────────────────────────────────────── */
const GraduateBatchModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [graduationYear, setGraduationYear] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!graduationYear || graduationYear.length !== 4) {
      return toast.error("Please enter a valid 4-digit year");
    }

    if (!window.confirm(`Are you sure you want to graduate the entire batch of ${graduationYear}? This will convert all matching Enrolled/Final Year students to Alumni status.`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await graduateBatch({ graduationYear: parseInt(graduationYear) });
      toast.success(res.data.message || "Batch graduated successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to graduate batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Graduate Batch</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">
              This action will permanently convert all <span className="font-bold">Enrolled</span> and <span className="font-bold">Final Year</span> students matching the provided Graduation Year into <span className="font-bold">Alumni</span>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Graduation Year *</label>
            <input 
              required 
              type="number" 
              value={graduationYear} 
              onChange={(e) => setGraduationYear(e.target.value)} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
              placeholder="e.g. 2024" 
              min="2000" 
              max="2099" 
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChevronRight className="w-4 h-4 mr-2" />} Execute Graduation
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ManageMembers;
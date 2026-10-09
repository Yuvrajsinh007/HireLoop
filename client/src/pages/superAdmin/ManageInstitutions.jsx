import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { 
  Building2, Search, Filter, CheckCircle2, 
  Ban, RefreshCw, X, Loader2, Plus, Mail
} from "lucide-react";
import api from "../../services/api"; 
import { formatDate } from "../../utils/formatDate";

const STATUS_OPTIONS = ["active", "suspended", "pending", "rejected"];

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchInstitutions();
  }, [page, debouncedSearch, statusFilter]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/super-admin/institutions", { params });
      setInstitutions(res.data.data?.institutions || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id, name) => {
    if (!window.confirm(`Are you sure you want to suspend ${name}? All users under this institution will instantly lose access.`)) return;
    try {
      await api.put(`/super-admin/institutions/${id}/suspend`);
      toast.success(`${name} has been suspended.`);
      fetchInstitutions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to suspend institution");
    }
  };

  const handleReactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to reactivate ${name}?`)) return;
    try {
      await api.put(`/super-admin/institutions/${id}/reactivate`);
      toast.success(`${name} is now active again.`);
      fetchInstitutions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reactivate institution");
    }
  };

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to approve ${name}?`)) return;
    try {
      await api.put(`/super-admin/institutions/${id}/approve`);
      toast.success(`${name} has been approved.`);
      fetchInstitutions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve institution");
    }
  };

  const handleReject = async (id, name) => {
    const reason = window.prompt(`Please provide a reason for rejecting ${name}:`);
    if (reason === null) return;
    try {
      await api.put(`/super-admin/institutions/${id}/reject`, { reason });
      toast.success(`${name} has been rejected.`);
      fetchInstitutions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject institution");
    }
  };

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
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Manage Institutions</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Onboard new colleges and manage platform-wide access.
            </p>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Institution
          </button>
        </motion.div>

        {/* Toolbar */}
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
              placeholder="Search by college name or contact email..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          
          <div className="relative min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all capitalize"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Table Content */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] flex flex-col">
          {loading && institutions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader text="Fetching institutions..." />
            </div>
          ) : institutions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Institutions Found</h3>
              <p className="text-sm font-medium text-gray-500">
                No colleges match your current search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Institution</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">College Admin</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Registered On</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {institutions.map((inst) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={inst._id} 
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 truncate max-w-[250px]" title={inst.name}>{inst.name}</p>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{inst.shortName || "No Abbreviation"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-800">{inst.primaryAdmin?.name || "Unknown"}</p>
                          <p className="text-xs font-medium text-gray-500">{inst.primaryAdmin?.email || "—"}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {formatDate(inst.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${
                            inst.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            inst.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            inst.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {inst.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {inst.status === 'pending' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {inst.status === 'rejected' && <X className="w-3 h-3 mr-1" />}
                            {inst.status === 'suspended' && <Ban className="w-3 h-3 mr-1" />}
                            {inst.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {inst.status === "pending" && (
                              <>
                                <button 
                                  onClick={() => handleApprove(inst._id, inst.name)}
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                </button>
                                <button 
                                  onClick={() => handleReject(inst._id, inst.name)}
                                  className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {inst.status === "active" && (
                              <button 
                                onClick={() => handleSuspend(inst._id, inst.name)}
                                className="px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 border border-orange-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center"
                              >
                                <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                              </button>
                            )}
                            {inst.status === "suspended" && (
                              <button 
                                onClick={() => handleReactivate(inst._id, inst.name)}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center"
                              >
                                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reactivate
                              </button>
                            )}
                          </div>
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

      {/* Create Institution Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateInstitutionModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              fetchInstitutions();
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

/* ── Modal: Create Institution & Admin ───────────────────────────────────── */
const CreateInstitutionModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [tempCredentials, setTempCredentials] = useState(null);
  const [formData, setForm] = useState({
    name: "",
    shortName: "",
    primaryAdminName: "",
    primaryAdminEmail: "",
  });

  const handleChange = (e) => setForm({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Calls the new POST endpoint (Update your route to map this correctly if needed)
      const res = await api.post("/super-admin/institutions", formData); 
      
      toast.success("Institution onboarded successfully!");
      if (res.data.data?.temporaryPassword) {
        setTempCredentials({
          email: formData.primaryAdminEmail,
          password: res.data.data.temporaryPassword
        });
        onSuccess(); // Refresh the table behind the modal
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create institution");
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Onboard New Institution</h3>
          {!tempCredentials && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {tempCredentials ? (
          <div className="p-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-emerald-900 mb-1">Institution Created</h4>
              <p className="text-sm text-emerald-700">The college is now active. An invitation email has been sent to the primary admin.</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">College Admin Email</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900">
                  {tempCredentials.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Temporary Password</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono tracking-widest font-bold text-indigo-600">
                  {tempCredentials.password}
                </div>
              </div>
            </div>

            <button onClick={onClose} className="w-full px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div>
              <h4 className="text-sm font-bold text-indigo-900 mb-3 border-b border-indigo-100 pb-2">College Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Official Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Stanford University" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abbreviation / Short Name</label>
                  <input type="text" name="shortName" value={formData.shortName} onChange={handleChange} placeholder="e.g. SU" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-bold text-emerald-900 mb-3 border-b border-emerald-100 pb-2">Primary Admin Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Full Name *</label>
                  <input required type="text" name="primaryAdminName" value={formData.primaryAdminName} onChange={handleChange} placeholder="e.g. Jane Doe" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input required type="email" name="primaryAdminEmail" value={formData.primaryAdminEmail} onChange={handleChange} placeholder="admin@stanford.edu" className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Building2 className="w-4 h-4 mr-2" />} Create Institution
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ManageInstitutions;
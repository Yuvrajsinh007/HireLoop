import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { 
  Building2, Search, CheckCircle2, 
  Ban, RefreshCw, X, Loader2, Plus, Mail
} from "lucide-react";
import api from "../../services/api"; 
import { formatDate } from "../../utils/formatDate";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending Requests", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Rejected", value: "rejected" }
];

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // Defaults to pending requests

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
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
      toast.error(err?.response?.data?.message || "Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Approve ${name}? This will activate the college and migrate the record.`)) return;
    try {
      await api.put(`/super-admin/institutions/${id}/approve`);
      toast.success(`${name} has been approved and moved to active institutions!`);
      // Update UI state immediately
      if (statusFilter === "pending") {
        setInstitutions(prev => prev.filter(item => item._id !== id));
      } else {
        fetchInstitutions();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve institution");
    }
  };

  const handleReject = async (id, name) => {
    const reason = window.prompt(`Please provide a reason for rejecting ${name}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("A rejection reason is required.");
      return;
    }

    try {
      await api.put(`/super-admin/institutions/${id}/reject`, { reason });
      toast.success(`${name} has been rejected.`);
      fetchInstitutions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject institution");
    }
  };

  const handleSuspend = async (id, name) => {
    const reason = window.prompt(`Reason for suspending ${name}:`);
    if (reason === null) return;
    try {
      await api.put(`/super-admin/institutions/${id}/suspend`, { reason });
      toast.success(`${name} has been suspended.`);
      fetchInstitutions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to suspend institution");
    }
  };

  const handleReactivate = async (id, name) => {
    if (!window.confirm(`Reactivate ${name}?`)) return;
    try {
      await api.put(`/super-admin/institutions/${id}/reactivate`);
      toast.success(`${name} is now active.`);
      fetchInstitutions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reactivate institution");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Manage Universities & Requests</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Review temporary university registration requests and govern platform organizations.
            </p>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Onboard Manually
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === tab.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
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
              placeholder="Search by institution name or email..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] flex flex-col">
          {loading && institutions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader text="Loading entries..." />
            </div>
          ) : institutions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <Building2 className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800">No records found</h3>
              <p className="text-sm text-gray-500">There are no institutions matching this status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Primary Admin</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Record</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
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
                        className="hover:bg-indigo-50/20 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center shadow-sm">
                              <Building2 className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{inst.name}</p>
                              <p className="text-xs text-gray-500">{inst.contactEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-800">{inst.primaryAdmin?.name || inst.primaryAdminName || "—"}</p>
                          <p className="text-xs text-gray-500">{inst.primaryAdmin?.email || inst.primaryAdminEmail || "—"}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {inst.isRequest ? "Temporary Request" : "Main Institution"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(inst.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${
                            inst.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            inst.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            inst.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                            "bg-orange-50 text-orange-700 border-orange-200"
                          }`}>
                            {inst.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {inst.status === "pending" && (
                              <>
                                <button 
                                  onClick={() => handleApprove(inst._id, inst.name)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                </button>
                                <button 
                                  onClick={() => handleReject(inst._id, inst.name)}
                                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition shadow-sm flex items-center"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {inst.status === "active" && (
                              <button 
                                onClick={() => handleSuspend(inst._id, inst.name)}
                                className="px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-bold transition shadow-sm flex items-center"
                              >
                                <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                              </button>
                            )}
                            {inst.status === "suspended" && (
                              <button 
                                onClick={() => handleReactivate(inst._id, inst.name)}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition shadow-sm flex items-center"
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white shadow-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white shadow-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Creation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateInstitutionModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => fetchInstitutions()}
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
      const res = await api.post("/super-admin/institutions", formData);
      toast.success("Institution onboarded successfully!");
      if (res.data.data?.temporaryPassword) {
        setTempCredentials({
          email: formData.primaryAdminEmail,
          password: res.data.data.temporaryPassword,
        });
        onSuccess();
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Onboard Institution Directly</h3>
          {!tempCredentials && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {tempCredentials ? (
          <div className="p-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-emerald-900 mb-1">Institution Created</h4>
              <p className="text-sm text-emerald-700">Credentials have been created and an invite has been dispatched.</p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">{tempCredentials.email}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Temporary Password</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-indigo-600 font-bold">{tempCredentials.password}</div>
              </div>
            </div>
            <button onClick={onClose} className="w-full px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg">
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Cambridge University" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abbreviation</label>
              <input type="text" name="shortName" value={formData.shortName} onChange={handleChange} placeholder="e.g. CAM" className="w-full px-3 py-2 border rounded-lg text-sm uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Full Name *</label>
              <input required type="text" name="primaryAdminName" value={formData.primaryAdminName} onChange={handleChange} placeholder="e.g. Admin Officer" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input required type="email" name="primaryAdminEmail" value={formData.primaryAdminEmail} onChange={handleChange} placeholder="admin@cam.ac.uk" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg flex items-center">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Building2 className="w-4 h-4 mr-2" />} Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManageInstitutions;
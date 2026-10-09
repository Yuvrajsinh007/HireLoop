import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";
import { Shield, Activity, Clock, Filter, Server, MapPin } from "lucide-react";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const LIMIT = 15;

const ACTION_COLORS = {
  CREATE: "text-emerald-700 bg-emerald-50 border-emerald-200",
  UPDATE: "text-blue-700 bg-blue-50 border-blue-200",
  DELETE: "text-red-700 bg-red-50 border-red-200",
  LOGIN: "text-indigo-700 bg-indigo-50 border-indigo-200",
  APPROVE: "text-teal-700 bg-teal-50 border-teal-200",
  REJECT: "text-orange-700 bg-orange-50 border-orange-200",
  DEFAULT: "text-gray-700 bg-gray-50 border-gray-200"
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => {
    setPage(1);
  }, [actionFilter, entityFilter]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.resource = entityFilter;

      const res = await api.get("/audit", { params });
      const data = res.data.data;
      setLogs(data?.logs || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (action) => {
    const act = action?.toUpperCase() || "";
    if (act.includes("CREATE") || act.includes("REGISTER") || act.includes("POST")) return ACTION_COLORS.CREATE;
    if (act.includes("UPDATE") || act.includes("EDIT")) return ACTION_COLORS.UPDATE;
    if (act.includes("DELETE") || act.includes("REMOVE")) return ACTION_COLORS.DELETE;
    if (act.includes("LOGIN")) return ACTION_COLORS.LOGIN;
    if (act.includes("APPROVE") || act.includes("VERIFY")) return ACTION_COLORS.APPROVE;
    if (act.includes("REJECT") || act.includes("SUSPEND")) return ACTION_COLORS.REJECT;
    return ACTION_COLORS.DEFAULT;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">System Audit Logs</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Monitor platform activities, security events, and user actions.
            </p>
          </div>
          {!loading && (
            <div className="text-sm font-semibold text-gray-500 bg-white border border-gray-100 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-gray-900 font-bold">{total}</span> total event{total === 1 ? "" : "s"}
            </div>
          )}
        </motion.div>

        {/* Toolbar */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Filter className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="Filter by action (e.g. CREATE, LOGIN)..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="relative flex-1 w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Server className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              placeholder="Filter by entity (e.g. Drive, Application)..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Content Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] flex flex-col">
          {loading && logs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader text="Fetching audit trail..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Activity className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Logs Found</h3>
              <p className="text-sm font-medium text-gray-500">
                No activity records match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Entity</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {logs.map((log) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={log._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatDate(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.user ? (
                            <div className="flex items-center gap-3">
                              <Avatar src={log.user.avatar} name={log.user.name} size="sm" />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{log.user.name}</p>
                                <p className="text-xs font-medium text-gray-500">{log.role || log.user.role}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm italic text-gray-400">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${getBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{log.entity}</span>
                            {log.entityId && (
                              <span className="text-[10px] text-gray-400 font-mono">ID: {log.entityId.slice(-6)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-sm text-gray-600 max-w-xs">
                            {log.ip && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {log.ip}
                              </div>
                            )}
                            {log.meta && Object.keys(log.meta).length > 0 && (
                              <pre className="text-[10px] bg-gray-50 border border-gray-200 rounded p-2 mt-1 overflow-x-auto text-gray-500 font-mono">
                                {JSON.stringify(log.meta, null, 2)}
                              </pre>
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
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white shadow-sm disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white shadow-sm disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AuditLogs;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";
import {
  Users, Search, Filter, ShieldAlert,
  Building2, CheckCircle2, XCircle, RotateCcw,
} from "lucide-react";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";
import { ROLES, ACADEMIC_STATUS_LABELS, ACADEMIC_STATUS_COLORS } from "../../utils/constants";

const ROLE_OPTIONS = [
  { value: ROLES.SUPER_ADMIN,   label: "Super Admin" },
  { value: ROLES.COLLEGE_ADMIN, label: "College Admin" },
  { value: ROLES.OFFICER,       label: "Placement Officer" },
  { value: ROLES.MEMBER,        label: "Student / Alumni" },
];

const ROLE_BADGE_STYLES = {
  superAdmin:   "bg-slate-900 text-white border-slate-700",
  collegeAdmin: "bg-purple-50 text-purple-700 border-purple-200",
  officer:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  member:       "bg-blue-50 text-blue-700 border-blue-200",
};

const LIMIT = 15;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;

      const res = await api.get("/super-admin/users", { params });
      const data = res.data.data;
      setUsers(data?.users || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load platform users");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setRoleFilter("");
  };

  // Animation variants
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
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Global User Directory</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Monitor every registered account across all institutions on the platform.
            </p>
          </div>
          {!loading && (
            <div className="text-sm font-semibold text-gray-500 bg-white border border-gray-100 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-gray-900 font-bold">{total}</span> total user{total === 1 ? "" : "s"}
            </div>
          )}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email address..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="relative min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">All Platform Roles</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          {(searchQuery || roleFilter) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </motion.div>

        {/* Content Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] flex flex-col">
          {loading && users.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader text="Fetching global user database..." />
            </div>
          ) : users.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Users Found</h3>
              <p className="text-sm font-medium text-gray-500">
                No accounts match your current search or filter parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">User Profile</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Platform Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Lifecycle</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Institution</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Joined Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {users.map((user) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={user._id}
                        className="hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar src={user.avatar} name={user.name} size="md" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{user.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-xs font-medium text-gray-500">{user.email}</p>
                                {user.isEmailVerified && (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" title="Email Verified" />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${ROLE_BADGE_STYLES[user.role] || ROLE_BADGE_STYLES.member}`}>
                            {user.role === ROLES.SUPER_ADMIN && <ShieldAlert className="w-3 h-3 mr-1" />}
                            {ROLE_OPTIONS.find((r) => r.value === user.role)?.label || user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge text-[10px] ${ACADEMIC_STATUS_COLORS[user.academicStatus] || "badge-gray"}`}>
                            {ACADEMIC_STATUS_LABELS[user.academicStatus] || user.academicStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role === ROLES.SUPER_ADMIN ? (
                            <span className="text-sm font-medium text-gray-400 italic">— Global —</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-bold text-gray-800">
                                {user.institution?.shortName || user.institution?.name || "Unknown"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isActive ? (
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-bold text-red-600">
                              <XCircle className="w-4 h-4 mr-1.5" /> Inactive
                            </span>
                          )}
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

export default ManageUsers;


// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import DashboardLayout from "../../components/common/DashboardLayout";
// import Loader from "../../components/common/Loader";
// import Avatar from "../../components/common/Avatar";
// import toast from "react-hot-toast";
// import { 
//   Users, Search, Filter, ShieldAlert, 
//   Building2, CheckCircle2, XCircle 
// } from "lucide-react";
// import api from "../../services/api";
// import { formatDate } from "../../utils/formatDate";

// const ROLE_OPTIONS = [
//   { value: "superAdmin", label: "Super Admin" },
//   { value: "collegeAdmin", label: "College Admin" },
//   { value: "officer", label: "Placement Officer" },
//   { value: "member", label: "Student / Alumni" },
// ];

// const ManageUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Pagination & Filtering
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");

//   // Debounce search
//   useEffect(() => {
//     const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   useEffect(() => {
//     fetchUsers();
//   }, [page, debouncedSearch, roleFilter]);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const params = { page, limit: 15 };
//       if (debouncedSearch) params.search = debouncedSearch;
//       if (roleFilter) params.role = roleFilter;

//       const res = await api.get("/super-admin/users", { params });
//       setUsers(res.data.data?.users || []);
//       setTotalPages(res.data.data?.totalPages || 1);
//     } catch (err) {
//       toast.error("Failed to load platform users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     show: { opacity: 1, transition: { staggerChildren: 0.05 } }
//   };
//   const itemVariants = {
//     hidden: { opacity: 0, y: 10 },
//     show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
//   };

//   return (
//     <DashboardLayout>
//       <motion.div 
//         variants={containerVariants}
//         initial="hidden"
//         animate="show"
//         className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
//       >
//         {/* Header Section */}
//         <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-sm">
//                 <Users className="w-5 h-5 text-white" />
//               </div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Global User Directory</h1>
//             </div>
//             <p className="text-sm font-medium text-gray-500">
//               Monitor and search through all registered accounts across the entire platform.
//             </p>
//           </div>
//         </motion.div>

//         {/* Toolbar: Search & Filters */}
//         <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
//           <div className="relative flex-1">
//             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//               <Search className="w-4 h-4" />
//             </span>
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => {
//                 setSearchQuery(e.target.value);
//                 setPage(1);
//               }}
//               placeholder="Search users by name or email address..."
//               className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
//             />
//           </div>
          
//           <div className="relative min-w-[200px]">
//             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//               <Filter className="w-4 h-4" />
//             </span>
//             <select
//               value={roleFilter}
//               onChange={(e) => {
//                 setRoleFilter(e.target.value);
//                 setPage(1);
//               }}
//               className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
//             >
//               <option value="">All Platform Roles</option>
//               {ROLE_OPTIONS.map(role => (
//                 <option key={role.value} value={role.value}>{role.label}</option>
//               ))}
//             </select>
//           </div>
//         </motion.div>

//         {/* Content Table */}
//         <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] flex flex-col">
//           {loading && users.length === 0 ? (
//             <div className="flex-1 flex items-center justify-center">
//               <Loader text="Fetching global user database..." />
//             </div>
//           ) : users.length === 0 ? (
//             <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
//               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
//                 <Users className="w-8 h-8 text-gray-300" />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-1">No Users Found</h3>
//               <p className="text-sm font-medium text-gray-500">
//                 No accounts match your current search or filter parameters.
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto flex-1">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="bg-gray-50/50 border-b border-gray-100">
//                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">User Profile</th>
//                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Platform Role</th>
//                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Institution</th>
//                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Joined Date</th>
//                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   <AnimatePresence>
//                     {users.map((user) => (
//                       <motion.tr 
//                         layout
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         key={user._id} 
//                         className="hover:bg-indigo-50/30 transition-colors"
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-3">
//                             <Avatar src={user.avatar} name={user.name} size="md" />
//                             <div>
//                               <p className="text-sm font-bold text-gray-900">{user.name}</p>
//                               <div className="flex items-center gap-1.5 mt-0.5">
//                                 <p className="text-xs font-medium text-gray-500">{user.email}</p>
//                                 {user.isEmailVerified && (
//                                   <CheckCircle2 className="w-3 h-3 text-emerald-500" title="Email Verified" />
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${
//                             user.role === 'superAdmin' ? 'bg-slate-900 text-white border-slate-700' :
//                             user.role === 'collegeAdmin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
//                             user.role === 'officer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
//                             'bg-blue-50 text-blue-700 border-blue-200'
//                           }`}>
//                             {user.role === 'superAdmin' && <ShieldAlert className="w-3 h-3 mr-1" />}
//                             {ROLE_OPTIONS.find(r => r.value === user.role)?.label || user.role}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {user.role === 'superAdmin' ? (
//                             <span className="text-sm font-medium text-gray-400 italic">— Global —</span>
//                           ) : (
//                             <div className="flex items-center gap-2">
//                               <Building2 className="w-4 h-4 text-gray-400" />
//                               <span className="text-sm font-bold text-gray-800">{user.institution?.shortName || user.institution?.name || "Unknown"}</span>
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
//                           {formatDate(user.createdAt)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {user.isActive ? (
//                             <span className="inline-flex items-center text-xs font-bold text-emerald-600">
//                               <CheckCircle2 className="w-4 h-4 mr-1.5" /> Active
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center text-xs font-bold text-red-600">
//                               <XCircle className="w-4 h-4 mr-1.5" /> Inactive
//                             </span>
//                           )}
//                         </td>
//                       </motion.tr>
//                     ))}
//                   </AnimatePresence>
//                 </tbody>
//               </table>
//             </div>
//           )}
          
//           {/* Pagination */}
//           {!loading && totalPages > 1 && (
//             <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-4 mt-auto">
//               <button
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white shadow-sm disabled:opacity-50 transition-colors"
//               >
//                 Previous
//               </button>
//               <span className="text-sm font-medium text-gray-600">
//                 Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
//               </span>
//               <button
//                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white shadow-sm disabled:opacity-50 transition-colors"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </motion.div>
//       </motion.div>
//     </DashboardLayout>
//   );
// };

// export default ManageUsers;


// // import { useState, useEffect, useCallback } from "react";
// // import DashboardLayout from "../../components/common/DashboardLayout";
// // import Avatar from "../../components/common/Avatar";
// // import Loader from "../../components/common/Loader";
// // import { getAllUsers, updateUser } from "../../services/officerService";
// // import { getRoleLabel, getRoleBadgeColor } from "../../utils/roleHelpers";
// // import { formatDate } from "../../utils/formatDate";
// // import toast from "react-hot-toast";

// // const ROLES = ["student","senior","officer","admin"];

// // const ManageUsers = () => {
// //   const [users, setUsers]     = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [search, setSearch]   = useState("");
// //   const [roleFilter, setRole] = useState("");
// //   const [page, setPage]       = useState(1);
// //   const [total, setTotal]     = useState(0);
// //   const [updating, setUpdating] = useState("");

// //   const fetchUsers = useCallback(async () => {
// //     try {
// //       setLoading(true);
// //       const res = await getAllUsers({ page, limit: 20, role: roleFilter, search });
// //       setUsers(res.data.data?.users || []);
// //       setTotal(res.data.data?.total || 0);
// //     } catch {
// //       toast.error("Failed to load users");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [page, roleFilter, search]);

// //   useEffect(() => {
// //     const timer = setTimeout(fetchUsers, search ? 400 : 0);
// //     return () => clearTimeout(timer);
// //   }, [fetchUsers]);

// //   useEffect(() => { setPage(1); }, [search, roleFilter]);

// //   const handleRoleChange = async (userId, newRole) => {
// //     try {
// //       setUpdating(userId);
// //       const res = await updateUser(userId, { role: newRole });
// //       setUsers((p) => p.map((u) => u._id === userId ? res.data.data : u));
// //       toast.success(`Role updated to ${getRoleLabel(newRole)}`);
// //     } catch {
// //       toast.error("Failed to update role");
// //     } finally {
// //       setUpdating("");
// //     }
// //   };

// //   const handleToggleActive = async (userId, isActive) => {
// //     try {
// //       setUpdating(userId);
// //       const res = await updateUser(userId, { isActive: !isActive });
// //       setUsers((p) => p.map((u) => u._id === userId ? res.data.data : u));
// //       toast.success(`User ${!isActive ? "activated" : "deactivated"}`);
// //     } catch {
// //       toast.error("Failed to update user");
// //     } finally {
// //       setUpdating("");
// //     }
// //   };

// //   const totalPages = Math.ceil(total / 20);

// //   return (
// //     <DashboardLayout>
// //       <div className="page-wrapper fade-in">
// //         <div className="mb-6">
// //           <h1 className="section-title mb-1">Manage Users 👥</h1>
// //           <p className="text-sm text-gray-500">View, promote and manage all platform users</p>
// //         </div>

// //         {/* Filters */}
// //         <div className="flex flex-wrap gap-3 mb-6">
// //           <div className="relative flex-1 min-w-48">
// //             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
// //             <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
// //               placeholder="Search by name or email..." className="input-field pl-9" />
// //           </div>
// //           <select value={roleFilter} onChange={(e) => setRole(e.target.value)} className="input-field w-auto">
// //             <option value="">All Roles</option>
// //             {ROLES.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
// //           </select>
// //         </div>

// //         {/* Stats */}
// //         <p className="text-sm text-gray-500 mb-4">{total} users found</p>

// //         {/* Table */}
// //         {loading ? (
// //           <div className="flex items-center justify-center min-h-64"><Loader size="lg" /></div>
// //         ) : (
// //           <div className="card overflow-hidden p-0">
// //             <div className="overflow-x-auto">
// //               <table className="w-full">
// //                 <thead>
// //                   <tr className="bg-gray-50 border-b border-gray-100">
// //                     {["User","Role","Status","Joined","Actions"].map((h) => (
// //                       <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
// //                     ))}
// //                   </tr>
// //                 </thead>
// //                 <tbody className="divide-y divide-gray-50">
// //                   {users.map((user) => (
// //                     <tr key={user._id} className="hover:bg-gray-50 transition-colors">
// //                       <td className="px-5 py-3">
// //                         <div className="flex items-center gap-3">
// //                           <Avatar src={user.avatar} name={user.name} size="sm" />
// //                           <div>
// //                             <p className="text-sm font-medium text-gray-800">{user.name}</p>
// //                             <p className="text-xs text-gray-400">{user.email}</p>
// //                           </div>
// //                         </div>
// //                       </td>
// //                       <td className="px-4 py-3">
// //                         <select
// //                           value={user.role}
// //                           onChange={(e) => handleRoleChange(user._id, e.target.value)}
// //                           disabled={updating === user._id}
// //                           className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
// //                         >
// //                           {ROLES.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
// //                         </select>
// //                       </td>
// //                       <td className="px-4 py-3">
// //                         <span className={`badge text-xs ${user.isActive ? "badge-green" : "badge-red"}`}>
// //                           {user.isActive ? "Active" : "Inactive"}
// //                         </span>
// //                         {user.isEmailVerified && (
// //                           <span className="badge badge-indigo text-xs ml-1">✅ Verified</span>
// //                         )}
// //                       </td>
// //                       <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
// //                       <td className="px-4 py-3">
// //                         <button
// //                           onClick={() => handleToggleActive(user._id, user.isActive)}
// //                           disabled={updating === user._id}
// //                           className={`text-xs font-medium hover:underline ${user.isActive ? "text-red-500" : "text-green-600"}`}
// //                         >
// //                           {updating === user._id ? "..." : user.isActive ? "Deactivate" : "Activate"}
// //                         </button>
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //         )}

// //         {/* Pagination */}
// //         {totalPages > 1 && (
// //           <div className="flex items-center justify-center gap-3 mt-6">
// //             <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
// //               className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
// //             <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
// //             <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
// //               className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
// //           </div>
// //         )}
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default ManageUsers;
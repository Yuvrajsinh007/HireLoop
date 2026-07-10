import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import { getAllUsers, updateUser } from "../../services/officerService";
import { getRoleLabel, getRoleBadgeColor } from "../../utils/roleHelpers";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const ROLES = ["student","senior","officer","admin"];

const ManageUsers = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRole] = useState("");
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [updating, setUpdating] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllUsers({ page, limit: 20, role: roleFilter, search });
      setUsers(res.data.data?.users || []);
      setTotal(res.data.data?.total || 0);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdating(userId);
      const res = await updateUser(userId, { role: newRole });
      setUsers((p) => p.map((u) => u._id === userId ? res.data.data : u));
      toast.success(`Role updated to ${getRoleLabel(newRole)}`);
    } catch {
      toast.error("Failed to update role");
    } finally {
      setUpdating("");
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      setUpdating(userId);
      const res = await updateUser(userId, { isActive: !isActive });
      setUsers((p) => p.map((u) => u._id === userId ? res.data.data : u));
      toast.success(`User ${!isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update user");
    } finally {
      setUpdating("");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">
        <div className="mb-6">
          <h1 className="section-title mb-1">Manage Users 👥</h1>
          <p className="text-sm text-gray-500">View, promote and manage all platform users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..." className="input-field pl-9" />
          </div>
          <select value={roleFilter} onChange={(e) => setRole(e.target.value)} className="input-field w-auto">
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
          </select>
        </div>

        {/* Stats */}
        <p className="text-sm text-gray-500 mb-4">{total} users found</p>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-64"><Loader size="lg" /></div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["User","Role","Status","Joined","Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disabled={updating === user._id}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${user.isActive ? "badge-green" : "badge-red"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                        {user.isEmailVerified && (
                          <span className="badge badge-indigo text-xs ml-1">✅ Verified</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(user._id, user.isActive)}
                          disabled={updating === user._id}
                          className={`text-xs font-medium hover:underline ${user.isActive ? "text-red-500" : "text-green-600"}`}
                        >
                          {updating === user._id ? "..." : user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";
import { 
  Users, UserPlus, ShieldCheck, Mail, Edit2, 
  X, Loader2, CheckCircle2, AlertCircle 
} from "lucide-react";
import api from "../../services/api";
import { getStaff, updateUser } from "../../services/officerService"; 

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getStaff();
      setStaff(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
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
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Manage Staff</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Invite placement officers and configure administrative access for your institution.
            </p>
          </div>
          
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Invite Staff
          </button>
        </motion.div>

        {/* Content Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader text="Fetching staff directory..." />
            </div>
          ) : staff.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Staff Found</h3>
              <p className="text-sm font-medium text-gray-500">
                Invite your first Placement Officer to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Staff Member</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {staff.map((member) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={member._id} 
                        className="hover:bg-emerald-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar src={member.avatar} name={member.name} size="md" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{member.name}</p>
                              <p className="text-xs font-medium text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${
                            member.role === 'collegeAdmin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {member.role === 'collegeAdmin' ? 'College Admin' : 'Placement Officer'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.isActive ? (
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-bold text-red-600">
                              <AlertCircle className="w-4 h-4 mr-1.5" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setEditingStaff(member)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Access
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Invite Staff Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteStaffModal 
            onClose={() => setShowInviteModal(false)}
            onSuccess={() => { setShowInviteModal(false); fetchStaff(); }}
          />
        )}
      </AnimatePresence>

      {/* Edit Access Modal */}
      <AnimatePresence>
        {editingStaff && (
          <EditAccessModal 
            member={editingStaff} 
            onClose={() => setEditingStaff(null)}
            onSuccess={() => { setEditingStaff(null); fetchStaff(); }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

/* ── Modal: Invite Staff ─────────────────────────────────────────────────── */
const InviteStaffModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [tempCredentials, setTempCredentials] = useState(null);
  const [formData, setForm] = useState({
    name: "",
    email: "",
    role: "officer",
  });

  const handleChange = (e) => setForm({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Calls the new backend controller endpoint
      const res = await api.post("/invitations/staff", formData);
      toast.success("Staff member invited successfully");
      
      // If the backend returns a temporary password, show it to the admin
      if (res.data.data?.temporaryPassword) {
        setTempCredentials({
          email: formData.email,
          password: res.data.data.temporaryPassword
        });
      } else {
        onSuccess();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to invite staff");
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
          <h3 className="text-lg font-bold text-gray-900">Invite Staff Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {tempCredentials ? (
          <div className="p-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-emerald-900 mb-1">Invitation Successful</h4>
              <p className="text-sm text-emerald-700">Please securely share these temporary login credentials with the staff member.</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
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

            <button onClick={onSuccess} className="w-full px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Jane Doe" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane.doe@college.edu" className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
                <option value="officer">Placement Officer</option>
                <option value="collegeAdmin">College Admin</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Send Invitation
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

/* ── Modal: Edit Staff Access ────────────────────────────────────────────── */
const EditAccessModal = ({ member, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setForm] = useState({
    role: member.role,
    isActive: member.isActive,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateUser(member._id, formData);
      toast.success("Staff access updated successfully");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update access");
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
          <h3 className="text-lg font-bold text-gray-900">Edit Access Levels</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl mb-2">
            <Avatar src={member.avatar} name={member.name} size="md" />
            <div>
              <p className="text-sm font-bold text-gray-900">{member.name}</p>
              <p className="text-xs font-medium text-gray-500">{member.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Authorization</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
              <option value="officer">Placement Officer</option>
              <option value="collegeAdmin">College Admin</option>
            </select>
          </div>

          <div className="flex items-start bg-amber-50 p-4 border border-amber-100 rounded-xl">
            <div className="flex items-center h-5">
              <input 
                type="checkbox" 
                name="isActive" 
                checked={formData.isActive} 
                onChange={handleChange} 
                className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded cursor-pointer" 
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-bold text-amber-900">Account Active Status</label>
              <p className="text-amber-700 mt-1">Unchecking this box will immediately revoke this staff member's access to the platform dashboard.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Updates
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ManageStaff;
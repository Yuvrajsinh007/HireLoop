import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatsCard from "../../components/dashboard/StatsCard";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { 
  ShieldAlert, Building2, Users, GraduationCap, 
  Clock, ArrowRight, Activity, CheckCircle2 
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../../services/api";

const PIE_COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#6366f1"];

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentInstitutions, setRecentInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, instRes] = await Promise.all([
          api.get("/super-admin/stats"),
          api.get("/super-admin/institutions?limit=5")
        ]);
        
        setStats(statsRes.data.data);
        setRecentInstitutions(instRes.data.data?.institutions || []);
      } catch (err) {
        toast.error("Failed to load platform statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading platform command center..." />
      </div>
    </DashboardLayout>
  );

  // Format Data for Recharts
  const userDistribution = [
    { name: "Students", value: stats?.totalStudents || 0 },
    { name: "Alumni", value: stats?.totalAlumni || 0 },
    { name: "Staff & Officers", value: stats?.totalOfficers || 0 },
  ].filter(d => d.value > 0);

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
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-sm">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Platform Command Center</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Global overview of all registered institutions, users, and pending platform approvals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/admin/verify" 
              className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              Verify Data
            </Link>
            <Link 
              to="/super-admin/institutions" 
              className="flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-colors"
            >
              Manage Institutions
            </Link>
          </div>
        </motion.div>

        {/* Top Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Institutions"  
            value={stats?.totalInstitutions || 0} 
            icon={<Building2 className="w-5 h-5 text-indigo-600" />} 
            color="indigo"
            subtitle={`${stats?.activeInstitutions || 0} active on platform`}
          />
          <StatsCard 
            title="Pending Approvals"
            value={stats?.pendingInstitutions || 0} 
            icon={<Clock className="w-5 h-5 text-amber-600" />} 
            color="amber" 
            subtitle="Require admin review"
          />
          <StatsCard 
            title="Total Users"
            value={stats?.totalUsers || 0} 
            icon={<Users className="w-5 h-5 text-blue-600" />} 
            color="blue"
            subtitle="Across all roles"
          />
          <StatsCard 
            title="Total Alumni"  
            value={stats?.totalAlumni || 0} 
            icon={<GraduationCap className="w-5 h-5 text-emerald-600" />} 
            color="emerald" 
            subtitle="Graduated platform members"
          />
        </motion.div>

        {/* Charts & Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Distribution Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Global User Distribution
            </h3>
            
            {userDistribution.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Users className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">No user data available</p>
              </div>
            ) : (
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={userDistribution} 
                      cx="50%" 
                      cy="45%" 
                      innerRadius={60} 
                      outerRadius={85}
                      dataKey="value" 
                      paddingAngle={4}
                      stroke="none"
                    >
                      {userDistribution.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Users']}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                    />
                    <Legend 
                      iconType="circle" 
                      iconSize={8} 
                      wrapperStyle={{ fontSize: "12px", fontWeight: 500, color: "#64748b", paddingTop: "10px" }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Recent Institutions Table */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
                <p className="text-sm text-gray-500 mt-1">Latest colleges to join the platform</p>
              </div>
              <Link to="/super-admin/institutions" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {recentInstitutions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <Building2 className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">No institutions registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Primary Admin</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentInstitutions.map((inst) => (
                      <tr key={inst._id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{inst.name}</p>
                              <p className="text-xs font-medium text-gray-500">{inst.shortName || "No Abbreviation"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">{inst.primaryAdmin?.name || "Pending"}</p>
                          <p className="text-xs text-gray-500">{inst.primaryAdmin?.email || inst.contactEmail}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm border ${
                            inst.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            inst.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            inst.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {inst.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
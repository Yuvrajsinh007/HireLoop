import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatsCard from "../../components/dashboard/StatsCard";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import { getOfficerDashboard } from "../../services/officerService"; // Adjust path if needed
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import toast from "react-hot-toast";
import { Users, CheckCircle2, Briefcase, HelpCircle, TrendingUp } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PIE_COLORS  = ["#4f46e5", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#0ea5e9"];

const OfficerDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await getOfficerDashboard();
        setData(res.data.data);
      } catch (err) {
        toast.error("Failed to load officer dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Compiling campus placement analytics..." />
      </div>
    </DashboardLayout>
  );

  // Format data for Recharts
  const monthlyData = (data?.monthlyTrend || []).map((m) => ({
    month: MONTH_NAMES[m._id.month - 1],
    placements: m.count,
  }));

  const programData = (data?.programStats || []).map((p) => ({
    program: p.program || "Unknown",
    total:   p.total,
    placed:  p.placed,
    rate:    p.total > 0 ? Math.round((p.placed / p.total) * 100) : 0,
  }));

  const pieData = programData
    .map((p) => ({ name: p.program, value: p.placed }))
    .filter((p) => p.value > 0);

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
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Placement Analytics</h1>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Real-time insights and operational overview for your campus placement drives.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Current Students"  
            value={data?.currentStudents ?? 0} 
            icon={<Users className="w-5 h-5 text-blue-600" />} 
            color="blue" 
          />
          <StatsCard 
            title="Placement Rate" 
            value={`${data?.placementRate ?? 0}%`} 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
            color="emerald"
            subtitle={`${data?.placedStudents ?? 0} placed students`} 
          />
          <StatsCard 
            title="Active Drives"       
            value={data?.activeDrives ?? 0} 
            icon={<Briefcase className="w-5 h-5 text-indigo-600" />} 
            color="indigo" 
            subtitle={`Out of ${data?.totalDrives ?? 0} total drives`}
          />
          <StatsCard 
            title="Pending Guidance"  
            value={data?.pendingGuidance ?? 0} 
            icon={<HelpCircle className="w-5 h-5 text-amber-600" />} 
            color="amber" 
            subtitle="Requires your approval"
          />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Placement Trend */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Placements (Last 6 Months)</h3>
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No placement data available for the selected period
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false} 
                      dx={-10}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", fontSize: "13px", fontWeight: 600, color: "#1e293b" }} 
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="placements" 
                      name="Placed Students"
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      dot={{ fill: "#ffffff", stroke: "#4f46e5", strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6, fill: "#4f46e5", stroke: "#c7d2fe", strokeWidth: 4 }} 
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Placed by Program Pie Chart */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Placed by Program</h3>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No program data available
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="45%" 
                      innerRadius={65} 
                      outerRadius={90}
                      dataKey="value" 
                      paddingAngle={4}
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => [`${value} Students`, 'Placed']}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                    />
                    <Legend 
                      iconType="circle" 
                      iconSize={8} 
                      wrapperStyle={{ fontSize: "12px", fontWeight: 500, color: "#64748b", paddingTop: "20px" }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Row: Table & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Program Stats Table */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Program Performance</h3>
            </div>
            {programData.length === 0 ? (
              <div className="p-8 text-center text-sm font-medium text-gray-400">No data available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      {["Program", "Total Pool", "Placed", "Rate", "Progress"].map((h) => (
                        <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {programData.map((p, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{p.program}</td>
                        <td className="px-6 py-4 font-medium text-gray-600">{p.total}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">{p.placed}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                            p.rate >= 70 ? "bg-emerald-100 text-emerald-700" : 
                            p.rate >= 40 ? "bg-amber-100 text-amber-700" : 
                            "bg-red-100 text-red-700"
                          }`}>
                            {p.rate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 w-48">
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(p.rate, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                p.rate >= 70 ? "bg-emerald-500" : 
                                p.rate >= 40 ? "bg-amber-500" : 
                                "bg-red-500"
                              }`} 
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Recent Placements List */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Recent Placements 🎉</h3>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {!data?.recentPlacements?.length ? (
                <div className="flex items-center justify-center h-full text-sm font-medium text-gray-400">
                  No recent placement records
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recentPlacements.map((app) => (
                    <div key={app._id} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors">
                      <Avatar 
                        src={app.student?.avatar} 
                        name={app.student?.name} 
                        size="md" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{app.student?.name}</p>
                        <p className="text-xs font-medium text-gray-600 truncate">{app.role} @ {app.company?.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {app.ctcOffered && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {app.ctcOffered} LPA
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {app.currentStage === "Joined" ? "JOINED" : "OFFERED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default OfficerDashboard;
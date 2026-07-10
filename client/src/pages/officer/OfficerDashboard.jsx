import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatsCard from "../../components/dashboard/StatsCard";
import Loader from "../../components/common/Loader";
import { getOfficerDashboard } from "../../services/officerService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import toast from "react-hot-toast";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS  = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#ef4444","#3b82f6"];

const OfficerDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getOfficerDashboard();
        setData(res.data.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" text="Loading officer dashboard..." />
      </div>
    </DashboardLayout>
  );

  const monthlyData = (data?.monthlyTrend || []).map((m) => ({
    month: MONTH_NAMES[m._id.month - 1],
    placements: m.count,
  }));

  const branchData = (data?.branchStats || []).map((b) => ({
    branch: b._id?.split(" ")[0] || "Other",
    total:  b.total,
    placed: b.placed,
    rate:   b.total > 0 ? Math.round((b.placed / b.total) * 100) : 0,
  }));

  const pieData = branchData.map((b) => ({ name: b.branch, value: b.placed })).filter((b) => b.value > 0);

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-1">Placement Officer Dashboard 📈</h1>
          <p className="text-sm text-gray-500">Real-time placement analytics for your campus</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Students"  value={data?.totalStudents  ?? 0} icon="🎓" color="indigo" />
          <StatsCard title="Placed Students" value={data?.placedStudents ?? 0} icon="✅" color="green"
            subtitle={`${data?.placementRate ?? 0}% placement rate`} />
          <StatsCard title="Companies"       value={data?.totalCompanies ?? 0} icon="🏢" color="yellow" />
          <StatsCard title="Upcoming Drives" value={data?.upcomingDrives ?? 0} icon="📅" color="purple" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Monthly Placement Trend */}
          <div className="lg:col-span-2 card">
            <h3 className="font-semibold text-gray-800 mb-4">Monthly Placement Trend</h3>
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="placements" stroke="#6366f1" strokeWidth={3}
                    dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Placed by Branch Pie */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Placed by Branch</h3>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No placements yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} placed`, n]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Branch Stats Table */}
        <div className="card mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Branch-wise Placement</h3>
          {branchData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Branch","Total Students","Placed","Placement %","Progress"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {branchData.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 pr-6 font-medium text-gray-800">{b.branch}</td>
                      <td className="py-3 pr-6 text-gray-600">{b.total}</td>
                      <td className="py-3 pr-6 text-green-600 font-semibold">{b.placed}</td>
                      <td className="py-3 pr-6">
                        <span className={`badge text-xs ${b.rate >= 70 ? "badge-green" : b.rate >= 40 ? "badge-yellow" : "badge-red"}`}>
                          {b.rate}%
                        </span>
                      </td>
                      <td className="py-3 pr-6 w-40">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(b.rate, 100)}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Placements */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Placements 🎉</h3>
          {!data?.recentPlacements?.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No recent placements</p>
          ) : (
            <div className="space-y-3">
              {data.recentPlacements.map((app) => (
                <div key={app._id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
                    {app.company?.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{app.role}</p>
                    <p className="text-xs text-gray-500">{app.company?.name}</p>
                  </div>
                  {app.ctcOffered && (
                    <span className="badge badge-green text-xs">{app.ctcOffered} LPA</span>
                  )}
                  <span className="badge badge-green text-xs">{app.currentStage}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OfficerDashboard;
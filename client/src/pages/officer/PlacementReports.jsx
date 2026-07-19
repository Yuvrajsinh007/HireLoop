import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import { getPlacementReport } from "../../services/officerService"; // Ensure this matches your service file
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { 
  FileText, DownloadCloud, TrendingUp, Building2, 
  Award, Calendar, DollarSign 
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell
} from "recharts";

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

const PlacementReports = () => {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear]       = useState(new Date().getFullYear().toString());

  // Generate last 5 years for the dropdown
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => { 
    fetchReport(); 
  }, [year]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getPlacementReport({ year });
      setReport(res.data.data);
    } catch {
      toast.error("Failed to load placement report");
    } finally {
      setLoading(false);
    }
  };

  // Format data for Recharts Bar Chart
  const chartData = Object.entries(report?.companyBreakdown || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Show top 10 companies to keep chart clean

  // CSV Export Functionality
  const exportToCSV = () => {
    if (!report?.placements?.length) {
      return toast.error("No data available to export");
    }

    const headers = ["Student Name", "Email", "Company", "Role", "CTC (LPA)", "Date"];
    const rows = report.placements.map(p => [
      `"${p.student?.name || '—'}"`,
      `"${p.student?.email || '—'}"`,
      `"${p.company?.name || '—'}"`,
      `"${p.role || '—'}"`,
      `"${p.ctcOffered || '0'}"`,
      `"${formatDate(p.updatedAt)}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `placement_report_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Report downloaded successfully");
  };

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
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Placement Reports</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Analyze year-wise placement metrics, CTC trends, and student success data.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                {years.map((y) => <option key={y} value={y}>Batch of {y}</option>)}
              </select>
            </div>
            <button 
              onClick={exportToCSV}
              disabled={loading || !report?.placements?.length}
              className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg shadow-sm hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadCloud className="w-4 h-4 mr-2" /> Export CSV
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader size="lg" text={`Generating reports for ${year}...`} />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Total Placements", value: report?.totalPlaced ?? 0, icon: <Award className="w-6 h-6 text-indigo-600" />, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
                { label: "Average CTC",      value: `${report?.avgCTC ?? 0} LPA`, icon: <TrendingUp className="w-6 h-6 text-emerald-600" />, color: "text-emerald-600",  bg: "bg-emerald-50 border-emerald-100"  },
                { label: "Highest CTC",      value: `${report?.maxCTC ?? 0} LPA`, icon: <DollarSign className="w-6 h-6 text-amber-600" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl border p-6 shadow-sm ${s.bg}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 bg-white rounded-lg shadow-sm border border-gray-100/50`}>
                      {s.icon}
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{year}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-1">{s.label}</p>
                  <p className={`text-3xl font-extrabold ${s.color} tracking-tight`}>{s.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Company Breakdown Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Top Recruiting Companies</h3>
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Building2 className="w-8 h-8 mb-2 text-gray-300" />
                  <span className="text-sm font-medium">No company data available for {year}</span>
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
                        width={120}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: "13px", fontWeight: 600, color: "#1e293b" }}
                        formatter={(value) => [value, 'Placements']}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            {/* Placements Detailed Table */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Placement Registry</h3>
                  <p className="text-sm font-medium text-gray-500">
                    Detailed record of all {report?.totalPlaced} offers secured in {year}
                  </p>
                </div>
              </div>

              {!report?.placements?.length ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <FileText className="w-10 h-10 mb-3 text-gray-300" />
                  <span className="text-sm font-medium">No placement records found for {year}</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-gray-100">
                        {["Student Details", "Company", "Role", "CTC", "Date"].map((h) => (
                          <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.placements.map((p) => (
                        <tr key={p._id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar src={p.student?.avatar} name={p.student?.name} size="sm" />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{p.student?.name || "—"}</p>
                                <p className="text-xs font-medium text-gray-500">{p.student?.email || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {p.company?.logo ? (
                                <img src={p.company.logo} alt="logo" className="w-5 h-5 object-contain rounded" />
                              ) : (
                                <Building2 className="w-5 h-5 text-gray-400" />
                              )}
                              <span className="text-sm font-bold text-gray-800">{p.company?.name || "—"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{p.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {p.ctcOffered ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {p.ctcOffered} LPA
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 font-medium">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                            {formatDate(p.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default PlacementReports;
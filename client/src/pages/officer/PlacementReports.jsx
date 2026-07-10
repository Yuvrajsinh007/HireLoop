import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import { getPlacementReport } from "../../services/officerService";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const PlacementReports = () => {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear]       = useState(new Date().getFullYear().toString());

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => { fetchReport(); }, [year]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getPlacementReport({ year });
      setReport(res.data.data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const companyRows = Object.entries(report?.companyBreakdown || {})
    .sort((a, b) => b[1] - a[1]);

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title mb-1">Placement Reports 📑</h1>
            <p className="text-sm text-gray-500">Year-wise placement analytics and student data</p>
          </div>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="input-field w-auto">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-64"><Loader size="lg" /></div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Placements", value: report?.totalPlaced ?? 0, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Average CTC",      value: `${report?.avgCTC ?? 0} LPA`, color: "text-green-600",  bg: "bg-green-50"  },
                { label: "Highest CTC",      value: `${report?.maxCTC ?? 0} LPA`, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((s) => (
                <div key={s.label} className={`card border-0 ${s.bg}`}>
                  <p className="text-sm text-gray-500 font-medium mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">Academic year {year}</p>
                </div>
              ))}
            </div>

            {/* Company Breakdown */}
            <div className="card mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Placements by Company</h3>
              {companyRows.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No placement data for {year}</p>
              ) : (
                <div className="space-y-3">
                  {companyRows.map(([company, count]) => {
                    const pct = report?.totalPlaced > 0
                      ? Math.round((count / report.totalPlaced) * 100)
                      : 0;
                    return (
                      <div key={company} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                          {company[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{company}</span>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Placements Table */}
            <div className="card overflow-hidden p-0">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  All Placements — {year} ({report?.totalPlaced} records)
                </p>
              </div>
              {!report?.placements?.length ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                  No placement records found for {year}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Student","Email","Company","Role","CTC","Date"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {report.placements.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-gray-800">
                            {p.student?.user?.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {p.student?.user?.email || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{p.company?.name || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.role}</td>
                          <td className="px-4 py-3">
                            {p.ctcOffered
                              ? <span className="badge badge-green text-xs">{p.ctcOffered} LPA</span>
                              : <span className="text-xs text-gray-400">—</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(p.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlacementReports;
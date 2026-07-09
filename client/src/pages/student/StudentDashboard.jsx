import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatsCard from "../../components/dashboard/StatsCard";
import PlacementChart from "../../components/dashboard/PlacementChart";
import RecentActivity from "../../components/dashboard/RecentActivity";
import ProgressFunnel from "../../components/dashboard/ProgressFunnel";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats, getMyApplications } from "../../services/studentService";
import { formatDate } from "../../utils/formatDate";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.allSettled([
          getDashboardStats(),
          getMyApplications({ limit: 6 }),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        if (appsRes.status === "fulfilled")  setApplications(appsRes.value.data.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = stats?.byStage
    ? Object.entries(stats.byStage).map(([stage, count]) => ({ stage, count }))
    : [];

  const funnelStats = {
    Applied:     stats?.total || 0,
    Shortlisted: stats?.shortlisted || 0,
    Interview:   stats?.interviews || 0,
    Offer:       stats?.offers || 0,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" text="Loading your dashboard..." />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting()}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {formatDate(new Date())} · Here's your placement overview
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/companies" className="btn-secondary text-sm">🏢 Browse Companies</Link>
            <Link to="/journey" className="btn-primary text-sm">+ Add Application</Link>
          </div>
        </div>

        {/* Email verification banner */}
        {!user?.isEmailVerified && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">Verify your email</p>
              <p className="text-xs text-yellow-700">
                Check your inbox at <strong>{user?.email}</strong> to verify your account.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total Applied"  value={stats?.total ?? 0}       icon="📋" color="indigo" subtitle="companies applied" />
          <StatsCard title="Shortlisted"    value={stats?.shortlisted ?? 0} icon="✅" color="green"  subtitle="moved forward" />
          <StatsCard title="Interviews"     value={stats?.interviews ?? 0}  icon="🎯" color="yellow" subtitle="rounds attended" />
          <StatsCard title="Offers"         value={stats?.offers ?? 0}      icon="🎉" color="purple" subtitle={stats?.offers > 0 ? "congratulations!" : "keep going!"} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2"><PlacementChart data={chartData} /></div>
          <ProgressFunnel stats={funnelStats} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity applications={applications} />
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: "/journey",     icon: "📋", label: "Track Application"   },
                  { to: "/experiences", icon: "📝", label: "Read Experiences"    },
                  { to: "/mentors",     icon: "🤝", label: "Book Mentor Session" },
                  { to: "/profile",     icon: "👤", label: "Update Profile"      },
                ].map((a) => (
                  <Link key={a.to} to={a.to}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors text-sm font-medium"
                  >
                    <span>{a.icon}</span>{a.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="card bg-indigo-50 border-indigo-100">
              <h3 className="font-semibold text-indigo-800 mb-2 text-sm">💡 Tip of the Day</h3>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Update your application stages regularly so your dashboard stays accurate.
                Seniors can see anonymized trends to write better experiences for you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatsCard from "../../components/dashboard/StatsCard";
import PlacementChart from "../../components/dashboard/PlacementChart";
import RecentActivity from "../../components/dashboard/RecentActivity";
import ProgressFunnel from "../../components/dashboard/ProgressFunnel";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import {
  getDashboardStats,
  getMyApplications,
} from "../../services/memberService";
import { getEligibleDrives } from "../../services/driveService";
import { formatDate } from "../../utils/formatDate";
import { ACADEMIC_STATUS_LABELS } from "../../utils/constants";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [eligibleDrives, setEligibleDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [statsRes, appsRes, drivesRes] = await Promise.allSettled([
          getDashboardStats(),
          getMyApplications({ limit: 6 }),
          getEligibleDrives(),
        ]);

        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data.data);
        }

        if (appsRes.status === "fulfilled") {
          setApplications(
            appsRes.value.data.data?.applications || []
          );
        }

        if (drivesRes.status === "fulfilled") {
          setEligibleDrives(drivesRes.value.data.data || []);
        }
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = stats?.byStage
    ? Object.entries(stats.byStage).map(([stage, count]) => ({
        stage,
        count,
      }))
    : [];

  const funnelStats = {
    Applied: stats?.total || 0,
    Shortlisted: stats?.shortlisted || 0,
    Interview: stats?.interviews || 0,
    Offer: stats?.offers || 0,
  };

  const greeting = () => {
    const h = new Date().getHours();

    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            {formatDate(new Date())} ·{" "}
            <span className="text-indigo-600 font-medium">
              {ACADEMIC_STATUS_LABELS[user?.academicStatus] || "Student"}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/drives" className="btn-secondary text-sm">
            🚀 Browse Drives
          </Link>

          <Link to="/journey" className="btn-primary text-sm">
            + Add Application
          </Link>
        </div>
      </div>

      {/* Email Verification */}
      {!user?.isEmailVerified && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>

          <div>
            <p className="text-sm font-semibold text-yellow-800">
              Verify your email
            </p>

            <p className="text-xs text-yellow-700">
              Go to{" "}
              <Link
                to="/profile"
                className="underline font-medium"
              >
                Profile
              </Link>{" "}
              to verify <strong>{user?.email}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Applied"
          value={stats?.total ?? 0}
          icon="📋"
          color="indigo"
          subtitle="companies applied"
        />

        <StatsCard
          title="Shortlisted"
          value={stats?.shortlisted ?? 0}
          icon="✅"
          color="green"
          subtitle="moved forward"
        />

        <StatsCard
          title="Interviews"
          value={stats?.interviews ?? 0}
          icon="🎯"
          color="yellow"
          subtitle="rounds attended"
        />

        <StatsCard
          title="Offers"
          value={stats?.offers ?? 0}
          icon="🎉"
          color="purple"
          subtitle={
            stats?.offers > 0
              ? "congratulations!"
              : "keep going!"
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PlacementChart data={chartData} />
        </div>

        <ProgressFunnel stats={funnelStats} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity applications={applications} />
        </div>

        <div className="space-y-4">
          {/* Eligible Drives */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">
                Eligible Drives
              </h3>

              <Link
                to="/drives"
                className="text-xs text-indigo-600 hover:underline"
              >
                View all
              </Link>
            </div>

            {eligibleDrives.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No upcoming drives
              </p>
            ) : (
              <div className="space-y-2">
                {eligibleDrives.slice(0, 4).map((drive) => (
                  <Link
                    key={drive._id}
                    to={`/drives/${drive._id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                      {drive.company?.name?.[0] || "?"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {drive.company?.name}
                      </p>

                      <p className="text-xs text-gray-400 truncate">
                        {drive.title}
                      </p>
                    </div>

                    <span className="badge badge-indigo text-xs flex-shrink-0">
                      {drive.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">
              Quick Actions
            </h3>

            <div className="space-y-2">
              {[
                {
                  to: "/journey",
                  icon: "📋",
                  label: "Track Application",
                },
                {
                  to: "/experiences",
                  icon: "📝",
                  label: "Read Experiences",
                },
                {
                  to: "/guidance/request",
                  icon: "🤝",
                  label: "Request Guidance",
                },
                {
                  to: "/profile",
                  icon: "👤",
                  label: "Update Profile",
                },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors text-sm font-medium"
                >
                  <span>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
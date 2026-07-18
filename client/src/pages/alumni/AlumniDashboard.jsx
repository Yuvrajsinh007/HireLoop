import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatsCard from "../../components/dashboard/StatsCard";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getAlumniStats } from "../../services/memberService";
import { getAlumniSessions } from "../../services/guidanceService";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const AlumniDashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const [statsRes, sessRes] = await Promise.allSettled([
          getAlumniStats(),
          getAlumniSessions(),
        ]);

        if (statsRes.status === "fulfilled") {
          setData(statsRes.value.data.data);
        }

        if (sessRes.status === "fulfilled") {
          setSessions(sessRes.value.data.data || []);
        }
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

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

  const profile = data?.profile;
  const empHistory = data?.employmentHistory || [];
  const current = empHistory.find((e) => e.isCurrent);

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Alumni Dashboard · {formatDate(new Date())}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/alumni/career"
            className="btn-secondary text-sm"
          >
            💼 My Career
          </Link>

          <Link
            to="/alumni/sessions"
            className="btn-primary text-sm"
          >
            🤝 Sessions
          </Link>
        </div>
      </div>

      {/* Current Employment */}
      {current && (
        <div className="card mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide mb-1">
                Currently Working At
              </p>

              <h2 className="text-2xl font-bold">
                {current.companyName}
              </h2>

              <p className="text-indigo-200 text-sm mt-0.5">
                {current.jobTitle}
              </p>

              {current.ctc && (
                <p className="text-green-300 text-sm mt-1 font-semibold">
                  {current.ctc} LPA
                </p>
              )}
            </div>

            <div className="text-4xl opacity-80">🏢</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Companies Worked"
          value={empHistory.length}
          icon="🏢"
          color="indigo"
        />

        <StatsCard
          title="Sessions Conducted"
          value={
            sessions.filter((s) => s.status === "COMPLETED").length
          }
          icon="🤝"
          color="green"
        />

        <StatsCard
          title="Upcoming Sessions"
          value={
            sessions.filter((s) => s.status === "SCHEDULED").length
          }
          icon="📅"
          color="yellow"
        />

        <StatsCard
          title="Mentorship"
          value={
            profile?.isAvailableForMentorship ? "ON" : "OFF"
          }
          icon="💡"
          color="purple"
          subtitle="availability"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Upcoming Sessions
            </h3>

            <Link
              to="/alumni/sessions"
              className="text-xs text-indigo-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {sessions.filter((s) => s.status === "SCHEDULED").length ===
          0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📅</div>

              <p className="text-sm">
                No upcoming sessions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions
                .filter((s) => s.status === "SCHEDULED")
                .slice(0, 4)
                .map((session) => (
                  <div
                    key={session._id}
                    className="p-3 bg-indigo-50 rounded-xl border border-indigo-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {session.title}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {session.sessionType}
                        </p>

                        <p className="text-xs text-indigo-600 mt-1 font-medium">
                          📅 {formatDate(session.scheduledDate)}
                          {session.startTime &&
                            ` · ${session.startTime}`}
                        </p>
                      </div>

                      <span className="badge badge-indigo text-xs">
                        {session.students?.length || 0} student
                        {session.students?.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {session.meetLink && (
                      <a
                        href={session.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 mt-2 hover:underline"
                      >
                        🔗 Join Meeting
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">
              Quick Actions
            </h3>

            <div className="space-y-2">
              {[
                {
                  to: "/alumni/career",
                  icon: "💼",
                  label: "Update Career Info",
                },
                {
                  to: "/alumni/sessions",
                  icon: "🤝",
                  label: "View All Sessions",
                },
                {
                  to: "/experiences",
                  icon: "📝",
                  label: "Share Experience",
                },
                {
                  to: "/profile",
                  icon: "👤",
                  label: "Update Profile",
                },
              ].map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors text-sm font-medium"
                >
                  <span>{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mentorship */}
          <div
            className={`card border-2 ${
              profile?.isAvailableForMentorship
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {profile?.isAvailableForMentorship
                  ? "✅"
                  : "💤"}
              </span>

              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Mentorship:{" "}
                  {profile?.isAvailableForMentorship
                    ? "Available"
                    : "Unavailable"}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  {profile?.isAvailableForMentorship
                    ? "Students can request guidance through the placement office."
                    : "Turn on in Profile to receive guidance requests."}
                </p>

                <Link
                  to="/profile"
                  className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                >
                  Update in Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
import { useState, useEffect } from "react";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import { getAlumniSessions } from "../../services/guidanceService";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  SCHEDULED: "badge-indigo",
  ONGOING: "badge-green",
  COMPLETED: "badge-gray",
  CANCELLED: "badge-red",
};

const AlumniSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getAlumniSessions();
        setSessions(res.data.data || []);
      } catch {
        toast.error("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const filtered =
    filter === "all"
      ? sessions
      : sessions.filter((s) => s.status === filter);

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">
          My Mentorship Sessions 🤝
        </h1>

        <p className="text-sm text-gray-500">
          Sessions assigned to you by the placement office
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {["all", "SCHEDULED", "COMPLETED", "CANCELLED"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === item
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {item === "all"
              ? "All"
              : item.charAt(0) +
                item.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🤝</div>

          <p className="text-lg font-medium text-gray-500">
            No sessions found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((session) => (
            <div
              key={session._id}
              className="card"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">
                      {session.title}
                    </h3>

                    <span
                      className={`badge text-xs ${
                        STATUS_COLORS[session.status] ||
                        "badge-gray"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    {session.sessionType}
                  </p>

                  <p className="text-xs text-indigo-600 font-medium mt-1">
                    📅 {formatDate(session.scheduledDate)}
                    {session.startTime &&
                      ` · ${session.startTime}–${session.endTime}`}
                  </p>
                </div>

                {session.meetLink &&
                  session.status === "SCHEDULED" && (
                    <a
                      href={session.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      🔗 Join Meeting
                    </a>
                  )}
              </div>

              {/* Description */}
              {session.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {session.description}
                </p>
              )}

              {/* Students */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Students ({session.students?.length || 0})
                </p>

                <div className="flex flex-wrap gap-2">
                  {session.students?.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5"
                    >
                      <Avatar
                        src={student.avatar}
                        name={student.name}
                        size="xs"
                      />

                      <span className="text-xs font-medium text-gray-700">
                        {student.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {session.studentFeedbacks?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Student Feedback
                  </p>

                  {session.studentFeedbacks.map((feedback, index) => (
                    <div
                      key={index}
                      className="bg-green-50 rounded-lg p-3 mb-2"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from(
                          { length: 5 },
                          (_, i) => (
                            <span
                              key={i}
                              className={
                                i < feedback.rating
                                  ? "text-yellow-400"
                                  : "text-gray-200"
                              }
                            >
                              ★
                            </span>
                          )
                        )}
                      </div>

                      {feedback.feedback && (
                        <p className="text-xs text-gray-600">
                          {feedback.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniSessions;
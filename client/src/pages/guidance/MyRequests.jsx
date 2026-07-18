import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { getMyGuidanceRequests } from "../../services/guidanceService";
import { GUIDANCE_STATUS } from "../../utils/constants";
import { timeAgo } from "../../utils/formatDate";
import toast from "react-hot-toast";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const res = await getMyGuidanceRequests();
        setRequests(res.data.data || []);
      } catch {
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title mb-1">
            My Guidance Requests 📬
          </h1>

          <p className="text-sm text-gray-500">
            Track your submitted guidance requests
          </p>
        </div>

        <Link
          to="/guidance/request"
          className="btn-primary"
        >
          + New Request
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📬</div>

          <p className="text-lg font-medium text-gray-500">
            No guidance requests yet
          </p>

          <p className="text-sm mt-1">
            Submit a request to get alumni guidance
          </p>

          <Link
            to="/guidance/request"
            className="btn-primary mt-5"
          >
            Request Guidance
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const statusInfo =
              GUIDANCE_STATUS[req.status] || {
                label: req.status,
                color: "badge-gray",
              };

            return (
              <div
                key={req._id}
                className="card"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900">
                        {req.topic}
                      </h3>

                      <span
                        className={`badge text-xs ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    {req.targetCompanyName && (
                      <p className="text-sm text-gray-500">
                        🏢 {req.targetCompanyName}

                        {req.targetRole && (
                          <span className="text-gray-400">
                            {" "}
                            · {req.targetRole}
                          </span>
                        )}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(req.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                  {req.description}
                </p>

                {/* Timeline */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    "PENDING_REVIEW",
                    "ALUMNI_CONTACTED",
                    "SESSION_SCHEDULED",
                    "COMPLETED",
                  ].map((status, index) => {
                    const statuses = [
                      "PENDING_REVIEW",
                      "ALUMNI_CONTACTED",
                      "ALUMNI_ACCEPTED",
                      "SESSION_SCHEDULED",
                      "COMPLETED",
                    ];

                    const currentIndex =
                      statuses.indexOf(req.status);

                    const thisIndex =
                      statuses.indexOf(status);

                    const isDone =
                      currentIndex >= thisIndex;

                    const isClosed =
                      req.status === "CLOSED" ||
                      req.status ===
                        "ALUMNI_DECLINED";

                    return (
                      <div
                        key={status}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            isClosed
                              ? "bg-red-400"
                              : isDone
                              ? "bg-indigo-500"
                              : "bg-gray-200"
                          }`}
                        />

                        <span
                          className={`text-xs ${
                            isDone
                              ? "text-gray-700 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {GUIDANCE_STATUS[status]
                            ?.label || status}
                        </span>

                        {index < 3 && (
                          <div
                            className={`w-6 h-px ${
                              isDone
                                ? "bg-indigo-300"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Closed */}
                {req.status === "CLOSED" && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">
                      Request Closed
                    </p>

                    {req.closedReason && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {req.closedReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Session Link */}
                {req.session && (
                  <div className="mt-3">
                    <Link
                      to="/guidance/sessions"
                      className="text-sm text-indigo-600 font-medium hover:underline"
                    >
                      📅 View Scheduled Session →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
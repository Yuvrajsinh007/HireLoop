import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/formatDate";
import { STAGE_COLORS } from "../../utils/constants";

const RecentActivity = ({ applications = [] }) => {
  if (applications.length === 0) {
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm">No applications yet</p>
          <Link to="/companies" className="text-indigo-600 text-sm mt-2 hover:underline">
            Browse companies →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        <Link to="/journey" className="text-sm text-indigo-600 hover:underline">
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {applications.slice(0, 6).map((app) => (
          <div
            key={app._id}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {/* Company logo / initial */}
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 font-bold text-indigo-700 text-sm">
              {app.company?.name?.[0] || "?"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {app.company?.name || "Unknown Company"}
              </p>
              <p className="text-xs text-gray-500 truncate">{app.role}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`badge text-xs ${STAGE_COLORS[app.currentStage] || "badge-gray"}`}>
                {app.currentStage}
              </span>
              <span className="text-xs text-gray-400">{timeAgo(app.updatedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
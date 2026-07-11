import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/formatDate";
import { STAGE_COLORS } from "../../utils/constants";
import { ArrowRight, Inbox, Building2 } from "lucide-react";

const RecentActivity = ({ applications = [] }) => {
  // FIX: Safety check to ensure applications is an array before trying to render it
  const safeApplications = Array.isArray(applications) ? applications : [];

  if (safeApplications.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
        <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <Inbox className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No applications logged yet</p>
          <Link to="/companies" className="text-brand-600 text-sm mt-3 font-semibold hover:text-brand-700 flex items-center gap-1">
            Browse companies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900">Recent Activity</h3>
        <Link to="/journey" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {safeApplications.slice(0, 6).map((app) => (
          <div
            key={app._id}
            className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
          >
            {/* Company icon fallback */}
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-600">
               {app.company?.name ? (
                 <span className="font-bold text-sm">{app.company.name[0]}</span>
               ) : (
                 <Building2 className="w-5 h-5 stroke-[1.5]" />
               )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {app.company?.name || "Unknown Company"}
              </p>
              <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{app.role}</p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className={`badge text-[10px] uppercase tracking-wider font-bold shadow-sm ${STAGE_COLORS[app.currentStage] || "badge-gray"}`}>
                {app.currentStage}
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                {timeAgo(app.updatedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
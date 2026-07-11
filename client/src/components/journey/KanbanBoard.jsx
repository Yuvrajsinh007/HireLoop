import KanbanCard from "./KanbanCard";
import { ClipboardList, CheckCircle2, Target, Award, XCircle, Plus, Inbox } from "lucide-react";

const COLUMNS = [
  {
    id: "Applied",
    label: "Applied",
    icon: ClipboardList,
    color: "border-gray-200 bg-gray-50/50",
    headerColor: "bg-white border-b border-gray-200 text-gray-700",
    stages: ["Applied"],
  },
  {
    id: "Shortlisted",
    label: "Shortlisted",
    icon: CheckCircle2,
    color: "border-brand-200 bg-brand-50/30",
    headerColor: "bg-white border-b border-brand-200 text-brand-700",
    stages: ["Shortlisted"],
  },
  {
    id: "Interview",
    label: "Interviews",
    icon: Target,
    color: "border-amber-200 bg-amber-50/30",
    headerColor: "bg-white border-b border-amber-200 text-amber-700",
    stages: [
      "Aptitude Test",
      "Coding Test",
      "Group Discussion",
      "Technical Interview",
      "HR Interview",
      "Management Round",
    ],
  },
  {
    id: "Offer",
    label: "Offers",
    icon: Award,
    color: "border-emerald-200 bg-emerald-50/30",
    headerColor: "bg-white border-b border-emerald-200 text-emerald-700",
    stages: ["Offer Received", "Joined"],
  },
  {
    id: "Rejected",
    label: "Rejected",
    icon: XCircle,
    color: "border-red-200 bg-red-50/30",
    headerColor: "bg-white border-b border-red-200 text-red-700",
    stages: ["Rejected", "On Hold", "Withdrew"],
  },
];

const KanbanBoard = ({ applications, onUpdated, onDeleted }) => {
  const getColumnApps = (column) =>
    applications.filter((app) => column.stages.includes(app.currentStage));

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-gray-400 shadow-sm">
        <Inbox className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-bold text-gray-900 mb-1">No applications yet</p>
        <p className="text-sm font-medium">Click "+ Add Application" to start tracking your journey</p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-6 min-h-[60vh] custom-scrollbar snap-x">
      {COLUMNS.map((col) => {
        const colApps = getColumnApps(col);
        const Icon = col.icon;
        return (
          <div
            key={col.id}
            className={`flex-shrink-0 w-80 rounded-2xl border ${col.color} flex flex-col shadow-sm snap-start`}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3.5 rounded-t-2xl ${col.headerColor}`}>
              <div className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 stroke-[1.5]" />
                <span className="font-bold text-sm tracking-wide uppercase">{col.label}</span>
              </div>
              <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md shadow-sm border border-gray-200">
                {colApps.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
              {colApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 opacity-50">
                  <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-xl mb-2 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider">Empty</span>
                </div>
              ) : (
                colApps.map((app) => (
                  <KanbanCard
                    key={app._id}
                    application={app}
                    onUpdated={onUpdated}
                    onDeleted={onDeleted}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
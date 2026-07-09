import KanbanCard from "./KanbanCard";

const COLUMNS = [
  {
    id: "Applied",
    label: "Applied",
    icon: "📋",
    color: "border-gray-300 bg-gray-50",
    headerColor: "bg-gray-100 text-gray-700",
    stages: ["Applied"],
  },
  {
    id: "Shortlisted",
    label: "Shortlisted",
    icon: "✅",
    color: "border-indigo-200 bg-indigo-50/40",
    headerColor: "bg-indigo-100 text-indigo-700",
    stages: ["Shortlisted"],
  },
  {
    id: "Interview",
    label: "Interviews",
    icon: "🎯",
    color: "border-yellow-200 bg-yellow-50/40",
    headerColor: "bg-yellow-100 text-yellow-700",
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
    icon: "🎉",
    color: "border-green-200 bg-green-50/40",
    headerColor: "bg-green-100 text-green-700",
    stages: ["Offer Received", "Joined"],
  },
  {
    id: "Rejected",
    label: "Rejected / Withdrew",
    icon: "❌",
    color: "border-red-200 bg-red-50/40",
    headerColor: "bg-red-100 text-red-700",
    stages: ["Rejected", "On Hold", "Withdrew"],
  },
];

const KanbanBoard = ({ applications, onUpdated, onDeleted }) => {
  const getColumnApps = (column) =>
    applications.filter((app) => column.stages.includes(app.currentStage));

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-lg font-medium text-gray-500">No applications yet</p>
        <p className="text-sm mt-1">Click "+ Add Application" to start tracking</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-96">
      {COLUMNS.map((col) => {
        const colApps = getColumnApps(col);
        return (
          <div
            key={col.id}
            className={`flex-shrink-0 w-72 rounded-xl border-2 ${col.color} flex flex-col`}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${col.headerColor}`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{col.icon}</span>
                <span className="font-semibold text-sm">{col.label}</span>
              </div>
              <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">
                {colApps.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {colApps.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-300 text-sm">
                  Empty
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
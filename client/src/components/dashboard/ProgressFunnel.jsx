const FUNNEL_STAGES = [
  { key: "Applied",     label: "Applied",     color: "bg-gray-400"  },
  { key: "Shortlisted", label: "Shortlisted", color: "bg-brand-400" },
  { key: "Interview",   label: "Interviews",  color: "bg-amber-400" },
  { key: "Offer",       label: "Offers",      color: "bg-emerald-400" },
];

const ProgressFunnel = ({ stats = {} }) => {
  const total = stats.Applied || 1; // avoid division by zero

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
      <h3 className="font-bold text-gray-900 mb-6">Placement Funnel</h3>
      <div className="space-y-5">
        {FUNNEL_STAGES.map((stage) => {
          const count = stats[stage.key] || 0;
          const pct = Math.round((count / total) * 100);

          return (
            <div key={stage.key} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{stage.label}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`${stage.color} h-full rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {total === 1 && !stats.Applied && (
        <p className="text-xs font-medium text-gray-400 text-center mt-6 p-3 bg-gray-50 rounded-lg">
          Start adding applications to generate your funnel
        </p>
      )}
    </div>
  );
};

export default ProgressFunnel;
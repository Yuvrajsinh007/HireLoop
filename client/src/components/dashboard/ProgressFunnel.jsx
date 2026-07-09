const FUNNEL_STAGES = [
    { key: "Applied",     label: "Applied",    color: "bg-gray-400"   },
    { key: "Shortlisted", label: "Shortlisted",color: "bg-indigo-400" },
    { key: "Interview",   label: "Interviews", color: "bg-yellow-400" },
    { key: "Offer",       label: "Offers",     color: "bg-green-400"  },
  ];
  
  const ProgressFunnel = ({ stats = {} }) => {
    const total = stats.Applied || 1; // avoid division by zero
  
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Placement Funnel</h3>
        <div className="space-y-3">
          {FUNNEL_STAGES.map((stage) => {
            const count = stats[stage.key] || 0;
            const pct = Math.round((count / total) * 100);
  
            return (
              <div key={stage.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{stage.label}</span>
                  <span className="text-sm font-semibold text-gray-800">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`${stage.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
  
        {total === 1 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Start adding applications to see your funnel
          </p>
        )}
      </div>
    );
  };
  
  export default ProgressFunnel;
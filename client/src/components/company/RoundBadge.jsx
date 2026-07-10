const ROUND_ICONS = {
    "Aptitude Test":        "🧮",
    "Coding Test":          "💻",
    "Group Discussion":     "🗣️",
    "Technical Interview":  "⚙️",
    "HR Interview":         "🤝",
    "Management Round":     "👔",
    "Other":                "📋",
  };
  
  const RoundBadge = ({ round, index }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm flex-shrink-0 font-bold text-indigo-700">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span>{ROUND_ICONS[round.name] || "📋"}</span>
          <span className="font-medium text-sm text-gray-800">{round.name}</span>
        </div>
        {round.description && (
          <p className="text-xs text-gray-500">{round.description}</p>
        )}
        {round.duration && (
          <p className="text-xs text-gray-400 mt-0.5">⏱ {round.duration}</p>
        )}
      </div>
    </div>
  );
  
  export default RoundBadge;
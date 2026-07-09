const StatsCard = ({ title, value, icon, color = "indigo", subtitle = "", trend = null }) => {
    const colorMap = {
      indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
      green:  { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-100"  },
      yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100" },
      red:    { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-100"    },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
    };
    const c = colorMap[color] || colorMap.indigo;
  
    return (
      <div className={`card border ${c.border} hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            {trend !== null && (
              <p className={`text-xs mt-1 font-medium ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% this month
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };
  
  export default StatsCard;
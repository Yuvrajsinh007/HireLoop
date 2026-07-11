const StatsCard = ({ title, value, icon: Icon, color = "indigo", subtitle = "", trend = null }) => {
  const colorMap = {
    indigo:  { bg: "bg-brand-50",    text: "text-brand-600",   border: "border-brand-100",   icon: "text-brand-600" },
    emerald: { bg: "bg-emerald-50",  text: "text-emerald-600", border: "border-emerald-100", icon: "text-emerald-600" },
    amber:   { bg: "bg-amber-50",    text: "text-amber-600",   border: "border-amber-100",   icon: "text-amber-600" },
    red:     { bg: "bg-red-50",      text: "text-red-600",     border: "border-red-100",     icon: "text-red-600" },
    purple:  { bg: "bg-purple-50",   text: "text-purple-600",  border: "border-purple-100",  icon: "text-purple-600" },
  };
  
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className={`bg-white rounded-2xl p-5 border ${c.border} hover:shadow-md transition-all duration-200 group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-semibold">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>}
          
          {trend !== null && (
            <p className={`text-xs mt-1.5 font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        
        {Icon && (
          <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            {typeof Icon === 'string' ? (
              <span className="text-2xl">{Icon}</span>
            ) : (
              <Icon className={`w-6 h-6 ${c.icon} stroke-[1.5]`} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
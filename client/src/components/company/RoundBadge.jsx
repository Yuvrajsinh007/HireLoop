import { Calculator, Code, Users, Settings, Handshake, UserCheck, ClipboardList, Clock } from "lucide-react";

const ROUND_ICONS = {
  "Aptitude Test":       Calculator,
  "Coding Test":         Code,
  "Group Discussion":    Users,
  "Technical Interview": Settings,
  "HR Interview":        Handshake,
  "Management Round":    UserCheck,
  "Other":               ClipboardList,
};

const RoundBadge = ({ round, index }) => {
  const Icon = ROUND_ICONS[round.name] || ClipboardList;

  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className="w-4 h-4 text-brand-500 stroke-[2]" />
          <span className="font-bold text-sm text-gray-900">{round.name}</span>
        </div>
        {round.description && (
          <p className="text-sm font-medium text-gray-500 leading-relaxed mb-2">{round.description}</p>
        )}
        {round.duration && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 w-fit px-2 py-1 rounded-md">
            <Clock className="w-3 h-3" /> {round.duration}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundBadge;
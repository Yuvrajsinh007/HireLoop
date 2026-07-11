import Avatar from "../common/Avatar";
import { formatDate } from "../../utils/formatDate";
import { Target, FileText, Code2, Compass, Building2, MessageCircle, ClipboardList, Clock, CalendarDays } from "lucide-react";

const TOPIC_ICONS = {
  "Mock Interview":          Target,
  "Resume Review":           FileText,
  "DSA Help":                Code2,
  "Career Guidance":         Compass,
  "Company Specific Prep":   Building2,
  "General Advice":          MessageCircle,
  "Other":                   ClipboardList,
};

const MentorCard = ({ mentor, slots, onBook }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 flex flex-col h-full">
    {/* Mentor Info */}
    <div className="flex items-center gap-4 mb-6">
      <Avatar src={mentor.avatar} name={mentor.name} size="lg" />
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{mentor.name}</h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{mentor.role}</p>
      </div>
    </div>

    {/* Available Slots */}
    <div className="flex-1 flex flex-col">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
        Available Slots ({slots.length})
      </p>
      
      {slots.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
          <p className="text-sm font-medium text-gray-400">No slots currently available</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {slots.slice(0, 3).map((slot) => {
            const Icon = TOPIC_ICONS[slot.topic] || ClipboardList;
            return (
              <div
                key={slot._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-white transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate mb-1">{slot.topic}</p>
                    <div className="flex flex-col gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(slot.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{slot.startTime}–{slot.endTime}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onBook(slot)}
                  className="bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shrink-0 shadow-sm"
                >
                  Book
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {slots.length > 3 && (
        <div className="mt-4 pt-3 border-t border-gray-50 text-center">
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
            +{slots.length - 3} more slots
          </span>
        </div>
      )}
    </div>
  </div>
);

export default MentorCard;
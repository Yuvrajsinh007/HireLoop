import Avatar from "../common/Avatar";
import { formatDate } from "../../utils/formatDate";

const TOPIC_ICONS = {
  "Mock Interview":          "🎯",
  "Resume Review":           "📄",
  "DSA Help":                "💻",
  "Career Guidance":         "🧭",
  "Company Specific Prep":   "🏢",
  "General Advice":          "💬",
  "Other":                   "📋",
};

const MentorCard = ({ mentor, slots, onBook }) => (
  <div className="card hover:shadow-md transition-shadow">
    {/* Mentor Info */}
    <div className="flex items-center gap-3 mb-4">
      <Avatar src={mentor.avatar} name={mentor.name} size="lg" />
      <div>
        <h3 className="font-bold text-gray-900">{mentor.name}</h3>
        <p className="text-xs text-gray-400 capitalize">{mentor.role} · Available for mentorship</p>
      </div>
    </div>

    {/* Available Slots */}
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Available Slots ({slots.length})
      </p>
      {slots.slice(0, 3).map((slot) => (
        <div
          key={slot._id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{TOPIC_ICONS[slot.topic] || "📋"}</span>
            <div>
              <p className="text-sm font-medium text-gray-700">{slot.topic}</p>
              <p className="text-xs text-gray-400">
                {formatDate(slot.date)} · {slot.startTime}–{slot.endTime} · {slot.duration}min
              </p>
            </div>
          </div>
          <button
            onClick={() => onBook(slot)}
            className="btn-primary text-xs px-3 py-1.5"
          >
            Book
          </button>
        </div>
      ))}
      {slots.length > 3 && (
        <p className="text-xs text-indigo-600 text-center mt-1">
          +{slots.length - 3} more slots available
        </p>
      )}
    </div>
  </div>
);

export default MentorCard;
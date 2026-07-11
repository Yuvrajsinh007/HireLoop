import { useState } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/formatDate";
import { upvoteExperience } from "../../services/experienceService";
import { useAuth } from '../../hooks/useAuth';
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";
import { ThumbsUp, Building2, ChevronRight } from "lucide-react";

const OUTCOME_COLORS = {
  Selected: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Rejected: "bg-red-50 text-red-700 border-red-100",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-100",
  Withdrew: "bg-gray-50 text-gray-600 border-gray-200",
};

const DIFFICULTY_COLORS = {
  Easy:   "text-emerald-700 bg-emerald-50 border-emerald-100",
  Medium: "text-amber-700 bg-amber-50 border-amber-100",
  Hard:   "text-red-700 bg-red-50 border-red-100",
};

const ExperienceCard = ({ experience, onUpvoted }) => {
  const { user } = useAuth();
  const [upvoteCount, setUpvoteCount] = useState(experience.upvoteCount || 0);
  const [hasUpvoted, setHasUpvoted]   = useState(
    experience.upvotes?.includes(user?._id)
  );
  const [loading, setLoading] = useState(false);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      const res = await upvoteExperience(experience._id);
      setUpvoteCount(res.data.data.upvoteCount);
      setHasUpvoted(res.data.data.hasUpvoted);
      if (onUpvoted) onUpvoted(experience._id, res.data.data);
    } catch {
      toast.error("Failed to upvote");
    } finally {
      setLoading(false);
    }
  };

  const author = experience.author;

  return (
    <Link to={`/experiences/${experience._id}`} className="block h-full">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 group h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={author?.avatar}
              name={author?.name || "Anonymous"}
              size="sm"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">
                {author?.name || "Anonymous"}
              </p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                {experience.branch || "Engineering"} · Batch of {experience.year}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border shadow-sm ${OUTCOME_COLORS[experience.outcome] || "bg-gray-50"}`}>
              {experience.outcome}
            </span>
            {experience.overallDifficulty && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${DIFFICULTY_COLORS[experience.overallDifficulty]}`}>
                {experience.overallDifficulty}
              </span>
            )}
          </div>
        </div>

        {/* Company + Role */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          {experience.company?.logo ? (
            <img
              src={experience.company.logo}
              alt={experience.company.name}
              className="w-8 h-8 rounded-lg object-cover shadow-sm bg-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-600">
              <Building2 className="w-4 h-4 stroke-[1.5]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-bold text-gray-900 text-sm truncate block">
              {experience.company?.name}
            </span>
            <span className="text-gray-500 text-xs font-medium truncate block mt-0.5">{experience.role}</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-5 leading-relaxed font-medium flex-1">
          {experience.summary}
        </p>

        {/* Resources */}
        {experience.resourcesUsed?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {experience.resourcesUsed.slice(0, 3).map((r) => (
              <span key={r} className="px-2 py-1 bg-gray-50 border border-gray-200 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">{r}</span>
            ))}
            {experience.resourcesUsed.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 border border-gray-200 text-gray-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                +{experience.resourcesUsed.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpvote}
              disabled={loading}
              className={`flex items-center gap-1.5 text-sm font-bold transition-all px-3 py-1.5 rounded-lg
                ${hasUpvoted
                  ? "bg-brand-50 text-brand-600 border border-brand-100"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-brand-600"
                }`}
            >
              <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-brand-600" : ""}`} />
              <span>{upvoteCount}</span>
            </button>

            {experience.outcome === "Selected" && experience.ctc && (
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                {experience.ctc} LPA
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">{timeAgo(experience.createdAt)}</span>
            <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExperienceCard;
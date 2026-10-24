import { useState } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/formatDate";
import { upvoteExperience } from "../../services/experienceService";
import { useAuth } from '../../hooks/useAuth';
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";
import { ThumbsUp, Building2, ChevronRight, IndianRupee } from "lucide-react";

const OUTCOME_COLORS = {
  Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
  Withdrew: "bg-slate-50 text-slate-600 border-slate-200",
};

const DIFFICULTY_COLORS = {
  Easy:   "text-emerald-700 bg-emerald-50 border-emerald-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
  Hard:   "text-red-700 bg-red-50 border-red-200",
};

const ExperienceCard = ({ experience, onUpvoted }) => {
  const { user } = useAuth();
  const [upvoteCount, setUpvoteCount] = useState(experience.upvoteCount || 0);
  const [hasUpvoted, setHasUpvoted]   = useState(experience.upvotes?.includes(user?._id));
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={author?.avatar} name={author?.name || "Anonymous"} size="sm" />
            <div>
              <p className="text-sm font-bold text-slate-900">{author?.name || "Anonymous"}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {experience.branch || "Engineering"} · Batch of {experience.year}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border shadow-sm ${OUTCOME_COLORS[experience.outcome] || "bg-slate-50"}`}>
              {experience.outcome}
            </span>
            {experience.overallDifficulty && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border shadow-sm ${DIFFICULTY_COLORS[experience.overallDifficulty]}`}>
                {experience.overallDifficulty}
              </span>
            )}
          </div>
        </div>

        {/* Company + Role */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
            {experience.company?.logo ? (
              <img src={experience.company.logo} alt={experience.company.name} className="w-full h-full object-contain p-1.5" />
            ) : (
              <Building2 className="w-5 h-5 text-indigo-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 text-sm truncate block group-hover:text-indigo-700 transition-colors">
              {experience.company?.name}
            </span>
            <span className="text-slate-500 text-xs font-bold truncate block mt-0.5">{experience.role}</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-600 line-clamp-3 mb-5 leading-relaxed font-medium flex-1">
          {experience.summary}
        </p>

        {/* Resources */}
        {experience.resourcesUsed?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {experience.resourcesUsed.slice(0, 3).map((r) => (
              <span key={r} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">{r}</span>
            ))}
            {experience.resourcesUsed.length > 3 && (
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                +{experience.resourcesUsed.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpvote}
              disabled={loading}
              className={`flex items-center gap-1.5 text-sm font-bold transition-all px-3 py-1.5 rounded-lg
                ${hasUpvoted ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 shadow-sm"}`}
            >
              <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-indigo-600" : ""}`} />
              <span>{upvoteCount}</span>
            </button>

            {experience.outcome === "Selected" && experience.ctc && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-sm flex items-center">
                <IndianRupee className="w-3 h-3 mr-0.5" /> {experience.ctc} LPA
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">{timeAgo(experience.createdAt)}</span>
            <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExperienceCard;
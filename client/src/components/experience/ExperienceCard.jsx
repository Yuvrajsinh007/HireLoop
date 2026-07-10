import { useState } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/formatDate";
import { upvoteExperience } from "../../services/experienceService";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const OUTCOME_COLORS = {
  Selected: "badge-green",
  Rejected: "badge-red",
  "On Hold": "badge-yellow",
  Withdrew: "badge-gray",
};

const DIFFICULTY_COLORS = {
  Easy:   "text-green-600 bg-green-50",
  Medium: "text-yellow-600 bg-yellow-50",
  Hard:   "text-red-600 bg-red-50",
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
    <Link to={`/experiences/${experience._id}`} className="block">
      <div className="card-hover group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={author?.avatar}
              name={author?.name || "Anonymous"}
              size="sm"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {author?.name || "Anonymous"}
              </p>
              <p className="text-xs text-gray-400">
                {experience.branch || "Engineering"} · {experience.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`badge text-xs ${OUTCOME_COLORS[experience.outcome] || "badge-gray"}`}>
              {experience.outcome}
            </span>
            {experience.overallDifficulty && (
              <span className={`badge text-xs ${DIFFICULTY_COLORS[experience.overallDifficulty]}`}>
                {experience.overallDifficulty}
              </span>
            )}
          </div>
        </div>

        {/* Company + Role */}
        <div className="flex items-center gap-2 mb-3">
          {experience.company?.logo && (
            <img
              src={experience.company.logo}
              alt={experience.company.name}
              className="w-6 h-6 rounded object-cover"
            />
          )}
          <div>
            <span className="font-semibold text-gray-900 text-sm">
              {experience.company?.name}
            </span>
            <span className="text-gray-400 text-sm mx-1.5">·</span>
            <span className="text-gray-600 text-sm">{experience.role}</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {experience.summary}
        </p>

        {/* Resources */}
        {experience.resourcesUsed?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {experience.resourcesUsed.slice(0, 3).map((r) => (
              <span key={r} className="badge badge-gray text-xs">{r}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3">
            {/* Upvote */}
            <button
              onClick={handleUpvote}
              disabled={loading}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors
                ${hasUpvoted
                  ? "text-indigo-600"
                  : "text-gray-400 hover:text-indigo-600"
                }`}
            >
              <span>{hasUpvoted ? "👍" : "👍"}</span>
              <span>{upvoteCount}</span>
            </button>

            {/* CTC if selected */}
            {experience.outcome === "Selected" && experience.ctc && (
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                {experience.ctc} LPA
              </span>
            )}
          </div>

          <span className="text-xs text-gray-400">{timeAgo(experience.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ExperienceCard;
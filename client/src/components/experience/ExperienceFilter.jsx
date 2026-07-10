import { BRANCHES, DIFFICULTY_LEVELS, EXPERIENCE_OUTCOMES } from "../../utils/constants";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const ExperienceFilter = ({ filters, onChange, onClear }) => {
  const handleChange = (key, value) => onChange({ ...filters, [key]: value });
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-3 items-center">

        {/* Outcome */}
        <select
          value={filters.outcome || ""}
          onChange={(e) => handleChange("outcome", e.target.value)}
          className="input-field w-auto min-w-32 text-sm"
        >
          <option value="">All Outcomes</option>
          {EXPERIENCE_OUTCOMES.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={filters.year || ""}
          onChange={(e) => handleChange("year", e.target.value)}
          className="input-field w-auto min-w-28 text-sm"
        >
          <option value="">All Years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Branch */}
        <select
          value={filters.branch || ""}
          onChange={(e) => handleChange("branch", e.target.value)}
          className="input-field w-auto min-w-36 text-sm"
        >
          <option value="">All Branches</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Difficulty */}
        <select
          value={filters.difficulty || ""}
          onChange={(e) => handleChange("difficulty", e.target.value)}
          className="input-field w-auto min-w-32 text-sm"
        >
          <option value="">Any Difficulty</option>
          {DIFFICULTY_LEVELS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sort || "-createdAt"}
          onChange={(e) => handleChange("sort", e.target.value)}
          className="input-field w-auto min-w-36 text-sm"
        >
          <option value="-createdAt">Latest First</option>
          <option value="-upvoteCount">Most Upvoted</option>
          <option value="-year">Recent Year</option>
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default ExperienceFilter;
import { BRANCHES, DIFFICULTY_LEVELS, EXPERIENCE_OUTCOMES } from "../../utils/constants";
import { X, Filter } from "lucide-react";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const ExperienceFilter = ({ filters, onChange, onClear }) => {
  const handleChange = (key, value) => onChange({ ...filters, [key]: value });
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-8">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-400 border-r border-gray-100 pr-4 py-1 hidden sm:flex">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
        </div>

        <select
          value={filters.outcome || ""}
          onChange={(e) => handleChange("outcome", e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all flex-1 min-w-[140px]"
        >
          <option value="">All Outcomes</option>
          {EXPERIENCE_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <select
          value={filters.year || ""}
          onChange={(e) => handleChange("year", e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all flex-1 min-w-[120px]"
        >
          <option value="">All Years</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          value={filters.branch || ""}
          onChange={(e) => handleChange("branch", e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all flex-[2] min-w-[180px]"
        >
          <option value="">All Branches</option>
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <select
          value={filters.difficulty || ""}
          onChange={(e) => handleChange("difficulty", e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all flex-1 min-w-[140px]"
        >
          <option value="">Any Difficulty</option>
          {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          value={filters.sort || "-createdAt"}
          onChange={(e) => handleChange("sort", e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all flex-1 min-w-[140px]"
        >
          <option value="-createdAt">Latest First</option>
          <option value="-upvoteCount">Most Upvoted</option>
          <option value="-year">Recent Year</option>
        </select>

        {hasFilters && (
          <button
            onClick={onClear}
            className="text-sm font-semibold text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 px-2 shrink-0"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default ExperienceFilter;
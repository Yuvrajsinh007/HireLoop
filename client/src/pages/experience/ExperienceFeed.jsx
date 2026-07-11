import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import ExperienceCard from "../../components/experience/ExperienceCard";
import ExperienceFilter from "../../components/experience/ExperienceFilter";
import ExperienceForm from "../../components/experience/ExperienceForm";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import { getExperiences } from "../../services/experienceService";
import toast from "react-hot-toast";
import { FileText, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

const ExperienceFeed = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  
  const [filters, setFilters] = useState({
    outcome: "",
    year: "",
    branch: "",
    difficulty: "",
    sort: "-createdAt",
  });

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExperiences({
        page,
        limit: 12,
        search,
        ...filters,
      });
      setExperiences(res.data.data?.experiences || []);
      setTotal(res.data.data?.total || 0);
    } catch {
      toast.error("Failed to load experiences");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    const timer = setTimeout(fetchExperiences, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchExperiences, search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const handleClearFilters = () => {
    setFilters({ outcome: "", year: "", branch: "", difficulty: "", sort: "-createdAt" });
    setSearch("");
  };

  const handleExperienceAdded = (newExp) => {
    setShowForm(false);
    fetchExperiences(); // Refetch to show the new experience
  };

  const handleUpvoted = (id, updatedData) => {
    setExperiences((prev) => 
      prev.map((exp) => exp._id === id ? { ...exp, upvoteCount: updatedData.upvoteCount } : exp)
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">Interview Experiences</h1>
            <p className="text-sm font-medium text-gray-500">
              Read real interview experiences from seniors to prepare for your placements.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-brand-600 text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Share Experience
          </button>
        </div>

        {/* Search Bar (Dedicated for Feed) */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, role, or keywords..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-sm transition-all"
          />
        </div>

        {/* Filters */}
        <ExperienceFilter 
          filters={filters} 
          onChange={setFilters} 
          onClear={handleClearFilters} 
        />

        {/* Results count */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {loading ? "Loading..." : `${total} ${total === 1 ? "experience" : "experiences"} found`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader />
          </div>
        ) : experiences.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-gray-400 shadow-sm">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-bold text-gray-900 mb-1">No experiences found</p>
            <p className="text-sm font-medium mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={handleClearFilters} className="text-brand-600 font-bold text-sm bg-brand-50 px-4 py-2 rounded-lg hover:bg-brand-100 transition-colors">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <ExperienceCard 
                key={exp._id} 
                experience={exp} 
                onUpvoted={handleUpvoted}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-white border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-gray-600 font-bold bg-gray-100 px-4 py-2 rounded-lg">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="bg-white border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Share Experience Modal */}
      {showForm && (
        <Modal size="xl" onClose={() => setShowForm(false)}>
          <ExperienceForm 
            onSuccess={handleExperienceAdded} 
            onCancel={() => setShowForm(false)} 
          />
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default ExperienceFeed;
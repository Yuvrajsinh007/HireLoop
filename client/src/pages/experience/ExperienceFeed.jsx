import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import ExperienceCard from "../../components/experience/ExperienceCard";
import ExperienceFilter from "../../components/experience/ExperienceFilter";
import ExperienceForm from "../../components/experience/ExperienceForm";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import { getExperiences } from "../../services/experienceService";
import toast from "react-hot-toast";
import { FileText, Plus, Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const ExperienceFeed = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  
  const [filters, setFilters] = useState({
    outcome: "", year: "", branch: "", difficulty: "", sort: "-createdAt",
  });

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExperiences({ page, limit: 12, search, ...filters });
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

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const handleClearFilters = () => {
    setFilters({ outcome: "", year: "", branch: "", difficulty: "", sort: "-createdAt" });
    setSearch("");
  };

  const handleExperienceAdded = () => {
    setShowForm(false);
    //  FIX: Redirect them to their own posts to see the "Pending" status!
    navigate("/my-experiences"); 
  };

  const handleUpvoted = (id, updatedData) => {
    setExperiences((prev) => 
      prev.map((exp) => exp._id === id ? { ...exp, upvoteCount: updatedData.upvoteCount } : exp)
    );
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center">
              <BookOpen className="w-7 h-7 mr-3 text-indigo-600" />
              Interview Experiences
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Read real interview experiences from seniors to prepare for your placements.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-indigo-600 text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-md shadow-indigo-200 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Share Experience
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, role, or keywords..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
          />
        </div>

        {/* Filters */}
        <ExperienceFilter filters={filters} onChange={setFilters} onClear={handleClearFilters} />

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader text="Loading experiences..." />
          </div>
        ) : experiences.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-24 text-slate-400 shadow-sm border-dashed">
            <FileText className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-900 mb-1">No experiences found</p>
            <p className="text-sm font-medium text-slate-500 mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={handleClearFilters} className="text-indigo-600 font-bold text-sm bg-indigo-50 border border-indigo-100 px-6 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors">
              Clear All Filters
            </button>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {experiences.map((exp) => (
                <motion.div key={exp._id} variants={itemVariants} exit={{ opacity: 0, scale: 0.9 }}>
                  <ExperienceCard experience={exp} onUpvoted={handleUpvoted} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm flex items-center">
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </button>
            <span className="text-sm text-slate-600 font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 12)} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm flex items-center">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <Modal size="xl" onClose={() => setShowForm(false)}>
          <ExperienceForm onSuccess={handleExperienceAdded} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default ExperienceFeed;
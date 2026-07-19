import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import ExperienceCard from "../../components/experience/ExperienceCard";
import Loader from "../../components/common/Loader";
import { getSavedExperiences } from "../../services/memberService";
import toast from "react-hot-toast";
import { Bookmark, Search, BookmarkMinus } from "lucide-react";

const SavedExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);
        const res = await getSavedExperiences();
        setExperiences(res.data.data || []);
      } catch {
        toast.error("Failed to load saved experiences");
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  // Client-side filtering for quick access
  const filteredExperiences = useMemo(() => {
    if (!searchQuery.trim()) return experiences;
    const query = searchQuery.toLowerCase();
    return experiences.filter(
      (exp) =>
        exp.company?.name?.toLowerCase().includes(query) ||
        exp.role?.toLowerCase().includes(query) ||
        exp.overallDifficulty?.toLowerCase().includes(query) ||
        exp.outcome?.toLowerCase().includes(query)
    );
  }, [experiences, searchQuery]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <Bookmark className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Saved Experiences</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Your personal library of bookmarked interview reviews and placement resources
            </p>
          </div>

          {/* Search Bar */}
          {!loading && experiences.length > 0 && (
            <div className="relative w-full md:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company or role..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          )}
        </motion.div>

        {/* Content Section */}
        <motion.div variants={itemVariants} className="min-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <Loader text="Loading your bookmarks..." />
            </div>
          ) : experiences.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400 shadow-sm"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <BookmarkMinus className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No saved experiences</h3>
              <p className="text-sm font-medium text-gray-500 mb-6 text-center max-w-sm">
                You haven't bookmarked any interview experiences yet. Browse the feed and save the ones that help your preparation.
              </p>
              <Link to="/experiences" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Browse Experiences
              </Link>
            </motion.div>
          ) : (
            <>
              {filteredExperiences.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 font-medium">No saved experiences match "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm font-medium text-gray-500">
                    Showing {filteredExperiences.length} bookmarked item{filteredExperiences.length !== 1 ? 's' : ''}
                  </p>
                  <AnimatePresence mode="popLayout">
                    {filteredExperiences.map((exp) => (
                      <motion.div 
                        key={exp._id}
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                      >
                        {/* Assuming ExperienceCard takes the experience prop and handles its own layout */}
                        <ExperienceCard experience={exp} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SavedExperiences;
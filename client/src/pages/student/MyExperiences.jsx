import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import ExperienceCard from "../../components/experience/ExperienceCard";
import Loader from "../../components/common/Loader";
import { getMyExperiences } from "../../services/experienceService";
import toast from "react-hot-toast";
import { FileText, Search, Plus, Clock } from "lucide-react";

const MyExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMyExperiences = async () => {
      try {
        setLoading(true);
        // This calls the backend route you already built!
        const res = await getMyExperiences();
        setExperiences(res.data.data || []);
      } catch {
        toast.error("Failed to load your experiences");
      } finally {
        setLoading(false);
      }
    };
    fetchMyExperiences();
  }, []);

  // Client-side filtering
  const filteredExperiences = useMemo(() => {
    if (!searchQuery.trim()) return experiences;
    const query = searchQuery.toLowerCase();
    return experiences.filter(
      (exp) =>
        exp.company?.name?.toLowerCase().includes(query) ||
        exp.role?.toLowerCase().includes(query) ||
        exp.outcome?.toLowerCase().includes(query)
    );
  }, [experiences, searchQuery]);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">My Experiences</h1>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Track the interview experiences you have shared with your juniors.
            </p>
          </div>

          <Link 
            to="/experiences" 
            className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Share New Experience
          </Link>
        </motion.div>

        {/* Status Banner */}
        <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-6 shadow-sm">
          <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Verification Process</p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              When you submit a new experience, it remains hidden from the main public feed until a Placement Officer reviews and verifies it. You can track your pending and verified posts here.
            </p>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div variants={itemVariants} className="min-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <Loader text="Loading your posts..." />
            </div>
          ) : experiences.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20 text-slate-400 shadow-sm border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">You haven't posted yet</h3>
              <p className="text-sm font-medium text-slate-500 mb-6 text-center max-w-sm">
                Share your interview journey and help your juniors prepare for their upcoming placement drives.
              </p>
              <Link to="/experiences" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Share Now
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search className="w-4 h-4" /></span>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your posts..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>

              {filteredExperiences.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 font-medium">No posts match "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredExperiences.map((exp) => (
                      <motion.div key={exp._id} layout variants={itemVariants} initial="hidden" animate="show" exit="exit" className="relative">
                        
                        {/* Custom Verification Badge overlaid on the card */}
                        <div className="absolute -top-3 -right-3 z-10">
                          {exp.isVerified ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">Verified & Live</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>
                          )}
                        </div>

                        <ExperienceCard experience={exp} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default MyExperiences;
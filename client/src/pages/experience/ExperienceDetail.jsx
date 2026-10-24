import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/common/DashboardLayout';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/common/Avatar';
import toast from 'react-hot-toast';
import { 
  getExperience, 
  upvoteExperience 
} from '../../services/experienceService';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/formatDate';
import { 
  ChevronLeft, Building2, Calendar, Target, 
  IndianRupee, ThumbsUp, Layers, CheckCircle2, 
  Lightbulb, BookOpen, Clock, AlertCircle, FileText
} from 'lucide-react';

const OUTCOME_COLORS = {
  Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
  Withdrew: "bg-slate-50 text-slate-700 border-slate-200",
};

const DIFFICULTY_COLORS = {
  Easy:   "text-emerald-700 bg-emerald-50 border-emerald-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
  Hard:   "text-red-700 bg-red-50 border-red-200",
};

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    const fetchExp = async () => {
      try {
        setLoading(true);
        const res = await getExperience(id);
        setExp(res.data.data);
      } catch (err) {
        toast.error("Experience not found");
        navigate("/experiences");
      } finally {
        setLoading(false);
      }
    };
    fetchExp();
  }, [id, navigate]);

  const handleUpvote = async () => {
    try {
      setUpvoting(true);
      const res = await upvoteExperience(id);
      setExp(prev => ({
        ...prev,
        upvoteCount: res.data.data.upvoteCount,
        upvotes: res.data.data.hasUpvoted 
          ? [...prev.upvotes, user._id] 
          : prev.upvotes.filter(uid => uid !== user._id)
      }));
    } catch (err) {
      toast.error("Failed to upvote");
    } finally {
      setUpvoting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Reading experience..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!exp) return null;

  const hasUpvoted = exp.upvotes?.includes(user?._id);
  const authorName = exp.isAnonymous ? "Anonymous" : exp.author?.name;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Back Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Feed
        </button>

        {/* Hero Header */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {exp.company?.logo ? (
                  <img src={exp.company.logo} alt={exp.company.name} className="w-full h-full object-contain p-2 bg-white" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-300" />
                )}
              </div>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {exp.role} at {exp.company?.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500 mb-4">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> Batch of {exp.year}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center"><Target className="w-4 h-4 mr-1.5" /> {exp.branch || "General"}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> Posted {timeAgo(exp.createdAt)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${OUTCOME_COLORS[exp.outcome]}`}>
                    {exp.outcome}
                  </span>
                  {exp.overallDifficulty && (
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${DIFFICULTY_COLORS[exp.overallDifficulty]}`}>
                      {exp.overallDifficulty}
                    </span>
                  )}
                  {exp.outcome === "Selected" && exp.ctc > 0 && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-1" /> {exp.ctc} LPA
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Upvote Button (Desktop Top Right) */}
            <div className="flex shrink-0">
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-sm transition-all
                  ${hasUpvoted 
                    ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"
                  }`}
              >
                <ThumbsUp className={`w-5 h-5 ${hasUpvoted ? "fill-indigo-600" : ""}`} />
                <span>{exp.upvoteCount || 0} Helpful</span>
              </button>
            </div>

          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN CONTENT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Summary Section */}
            <motion.div variants={itemVariants}>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" /> Overall Experience
              </h2>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {exp.summary}
                </p>
              </div>
            </motion.div>

            {/* Interview Rounds Timeline */}
            {exp.rounds?.length > 0 && (
              <motion.div variants={itemVariants}>
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-indigo-500" /> Interview Rounds
                </h2>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div className="space-y-8">
                    {exp.rounds.map((round, idx) => (
                      <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
                        
                        {/* Timeline line */}
                        {idx !== exp.rounds.length - 1 && (
                          <div className="absolute top-10 left-5 sm:left-6 w-0.5 h-full -ml-px bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                        )}

                        {/* Number Bubble */}
                        <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-indigo-700 font-bold text-sm sm:text-base">{idx + 1}</span>
                        </div>

                        {/* Round Content */}
                        <div className="flex-1 pt-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900">{round.roundName}</h3>
                            <div className="flex gap-2 shrink-0">
                              {round.difficulty && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${DIFFICULTY_COLORS[round.difficulty]}`}>
                                  {round.difficulty}
                                </span>
                              )}
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border flex items-center ${
                                round.outcome === "Cleared" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                round.outcome === "Eliminated" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}>
                                {round.outcome === "Cleared" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {round.outcome}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100 mt-3">
                            {round.description || <span className="italic text-slate-400">No specific details provided for this round.</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* SIDEBAR COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Author Profile */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Posted By</h3>
              <div className="flex items-center gap-4">
                <Avatar 
                  src={exp.isAnonymous ? null : exp.author?.avatar} 
                  name={authorName} 
                  size="md" 
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{authorName}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {exp.isAnonymous ? "Identity Hidden" : (exp.author?.academicStatus || "Student")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tips for Juniors */}
            {exp.tips && (
              <motion.div variants={itemVariants} className="bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm relative overflow-hidden">
                <Lightbulb className="absolute -right-4 -top-4 w-24 h-24 text-amber-500/10 pointer-events-none" />
                <h3 className="text-base font-bold text-amber-900 mb-3 flex items-center relative z-10">
                  <Lightbulb className="w-5 h-5 mr-2 text-amber-600" /> Advice & Tips
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed relative z-10 whitespace-pre-wrap">
                  {exp.tips}
                </p>
              </motion.div>
            )}

            {/* Resources Used */}
            {exp.resourcesUsed?.length > 0 && (
              <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-500" /> Preparation Resources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exp.resourcesUsed.map((res, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                      {res}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Admin Notice (If Unverified) */}
            {!exp.isVerified && (
              <motion.div variants={itemVariants} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  This experience is currently pending verification by placement officers.
                </p>
              </motion.div>
            )}
            
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ExperienceDetail;
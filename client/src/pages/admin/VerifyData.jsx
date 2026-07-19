import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";
import {
  CheckCircle2, Clock, ShieldCheck, FileText,
  Building2, Check,
} from "lucide-react";
import { getExperiences, verifyExperience } from "../../services/experienceService";
import { timeAgo } from "../../utils/formatDate";

const VerifyData = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [verifying, setVerifying]     = useState("");
  const [activeTab, setActiveTab]     = useState("pending"); // 'pending' | 'verified'

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      // Staff role auto-includes unverified experiences (enforced server-side)
      const res = await getExperiences({ limit: 100, sort: "-createdAt" });
      setExperiences(res.data.data?.experiences || []);
    } catch {
      toast.error("Failed to load interview experiences");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      setVerifying(id);
      await verifyExperience(id);
      setExperiences((prev) =>
        prev.map((e) => (e._id === id ? { ...e, isVerified: true } : e))
      );
      toast.success("Experience verified and published!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to verify experience");
    } finally {
      setVerifying("");
    }
  };

  const pendingExp  = experiences.filter((e) => !e.isVerified);
  const verifiedExp = experiences.filter((e) => e.isVerified);
  const displayData = activeTab === "pending" ? pendingExp : verifiedExp;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Data Verification</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Review and moderate interview experiences before they're published to students.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-1">Pending Verification</p>
              <p className="text-4xl font-extrabold text-amber-600">{pendingExp.length}</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-amber-50">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">Verified Experiences</p>
              <p className="text-4xl font-extrabold text-emerald-600">{verifiedExp.length}</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-50">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex space-x-1 bg-gray-100/50 p-1 rounded-lg w-fit mb-6 border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Pending <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{pendingExp.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
              activeTab === "verified"
                ? "bg-white text-emerald-600 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Verified <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{verifiedExp.length}</span>
          </button>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="min-h-[40vh]">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader text="Fetching submissions..." />
            </div>
          ) : displayData.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Queue is Empty</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                There are no {activeTab} interview experiences to display right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {displayData.map((exp) => (
                  <motion.div
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    key={exp._id}
                    className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                      activeTab === "pending" ? "border-amber-200 hover:shadow-md transition-shadow" : "border-gray-200"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {exp.company?.logo ? (
                              <img src={exp.company.logo} alt="logo" className="w-5 h-5 object-contain" />
                            ) : (
                              <Building2 className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="font-bold text-gray-900">{exp.company?.name || "Unknown Company"}</span>
                            <span className="text-gray-300 mx-1">•</span>
                            <span className="text-sm font-semibold text-indigo-600">{exp.role}</span>
                            <span className="text-gray-300 mx-1">•</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              exp.outcome === "Selected" ? "bg-emerald-100 text-emerald-800" :
                              exp.outcome === "Rejected" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {exp.outcome}
                            </span>
                            {exp.overallDifficulty && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                exp.overallDifficulty === "Hard" ? "bg-red-50 text-red-600" :
                                exp.overallDifficulty === "Medium" ? "bg-amber-50 text-amber-600" :
                                "bg-green-50 text-green-600"
                              }`}>
                                {exp.overallDifficulty}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <Avatar
                              src={exp.isAnonymous ? null : exp.author?.avatar}
                              name={exp.isAnonymous ? "Anonymous" : exp.author?.name}
                              size="xs"
                            />
                            <p className="text-xs font-medium text-gray-500">
                              Submitted by {exp.isAnonymous ? "Anonymous Student" : exp.author?.name} · {timeAgo(exp.createdAt)}
                              {exp.year ? ` · Batch ${exp.year}` : ""}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3">
                              {exp.summary}
                            </p>
                          </div>
                        </div>

                        {/* Action */}
                        {activeTab === "pending" && (
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleVerify(exp._id)}
                              disabled={verifying === exp._id}
                              className="w-full md:w-auto flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-70"
                            >
                              {verifying === exp._id ? (
                                "Verifying..."
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" /> Approve & Publish
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default VerifyData;
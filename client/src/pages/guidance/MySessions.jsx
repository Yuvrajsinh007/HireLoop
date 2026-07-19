import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Avatar from "../../components/common/Avatar";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getMySessions, submitSessionFeedback } from "../../services/guidanceService"; // Adjust import path if needed
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { 
  Calendar, Clock, Video, MessagesSquare, CheckCircle, 
  XCircle, Play, Star, X 
} from "lucide-react";

const MySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'past'
  
  // Feedback Modal State
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await getMySessions();
      setSessions(res.data.data || []);
    } catch {
      toast.error("Failed to load your mentorship sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please provide a rating out of 5 stars.");
    
    try {
      setSubmittingFeedback(true);
      await submitSessionFeedback(feedbackSession._id, { rating, feedback: feedbackText });
      toast.success("Feedback submitted successfully. Thank you!");
      
      // Update local state to reflect feedback submission
      setSessions(prev => prev.map(s => {
        if (s._id === feedbackSession._id) {
          const newFeedbackList = [...(s.studentFeedbacks || []), { student: user._id }];
          return { ...s, studentFeedbacks: newFeedbackList };
        }
        return s;
      }));
      
      setFeedbackSession(null);
      setRating(0);
      setFeedbackText("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Categorize sessions
  const upcomingSessions = sessions.filter(s => ["SCHEDULED", "ONGOING"].includes(s.status));
  const pastSessions = sessions.filter(s => ["COMPLETED", "CANCELLED"].includes(s.status));

  const displaySessions = activeTab === "upcoming" ? upcomingSessions : pastSessions;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SCHEDULED": return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Scheduled</span>;
      case "ONGOING": return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider animate-pulse">Ongoing</span>;
      case "COMPLETED": return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Completed</span>;
      case "CANCELLED": return <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Cancelled</span>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">Mentorship Sessions</h1>
          <p className="text-sm font-medium text-gray-500">
            View your upcoming meetings with alumni and access your past session history.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-lg w-fit mb-6 border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === "upcoming" 
                ? "bg-white text-indigo-600 shadow-sm border border-gray-200" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Upcoming ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === "past" 
                ? "bg-white text-indigo-600 shadow-sm border border-gray-200" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Past ({pastSessions.length})
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader text="Loading your sessions..." />
            </div>
          ) : displaySessions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No {activeTab} sessions</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {activeTab === "upcoming" 
                  ? "You don't have any mentorship sessions scheduled at the moment. Request guidance to get started."
                  : "You haven't completed any sessions yet."}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-2"
            >
              {displaySessions.map((session) => {
                const hasProvidedFeedback = session.studentFeedbacks?.some(f => f.student.toString() === user._id);
                
                return (
                  <motion.div 
                    key={session._id} 
                    variants={itemVariants}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                          {session.sessionType}
                        </span>
                        {getStatusBadge(session.status)}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={session.title}>
                        {session.title}
                      </h3>
                      
                      {session.description && (
                        <p className="text-sm text-gray-600 mb-5 line-clamp-2">
                          {session.description}
                        </p>
                      )}

                      <div className="space-y-2.5 mb-5 bg-gray-50/50 p-3 rounded-lg border border-gray-50">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2.5 text-indigo-500" />
                          <span className="font-medium">{formatDate(session.scheduledDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2.5 text-indigo-500" />
                          <span className="font-medium">
                            {session.startTime} {session.endTime ? `- ${session.endTime}` : ''} ({session.durationMinutes} min)
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Video className="w-4 h-4 mr-2.5 text-indigo-500" />
                          <span className="font-medium">{session.meetingPlatform}</span>
                        </div>
                      </div>

                      <div className="flex items-center pt-4 border-t border-gray-100 mt-auto">
                        <Avatar src={session.alumni?.avatar} name={session.alumni?.name} size="sm" />
                        <div className="ml-3">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Mentored By</p>
                          <p className="text-sm font-bold text-gray-900">{session.alumni?.name || "Unknown Alumni"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                      {session.status === "SCHEDULED" || session.status === "ONGOING" ? (
                        <a 
                          href={session.meetLink || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
                            session.meetLink 
                              ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                          onClick={(e) => !session.meetLink && e.preventDefault()}
                        >
                          <Play className="w-4 h-4 mr-2 fill-current" /> 
                          {session.meetLink ? "Join Meeting" : "Link Not Provided Yet"}
                        </a>
                      ) : session.status === "COMPLETED" ? (
                        hasProvidedFeedback ? (
                          <div className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md border border-emerald-100">
                            <CheckCircle className="w-4 h-4 mr-2" /> Feedback Submitted
                          </div>
                        ) : (
                          <button
                            onClick={() => setFeedbackSession(session)}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                          >
                            <MessagesSquare className="w-4 h-4 mr-2" /> Share Feedback
                          </button>
                        )
                      ) : (
                        <div className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md border border-red-100">
                          <XCircle className="w-4 h-4 mr-2" /> Session Cancelled
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Session Feedback</h3>
                <button onClick={() => setFeedbackSession(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleFeedbackSubmit} className="p-6">
                <p className="text-sm font-medium text-gray-600 mb-4">
                  How was your session <span className="font-bold text-gray-900">"{feedbackSession.title}"</span> with {feedbackSession.alumni?.name}?
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300 fill-transparent"
                        } transition-colors`} 
                      />
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Did the session help your preparation? What went well?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setFeedbackSession(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback || rating === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default MySessions;
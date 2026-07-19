import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";
import { 
  Inbox, Search, CheckCircle2, XCircle, Clock, 
  UserPlus, CalendarPlus, X, Briefcase, Building2, ChevronDown, Check
} from "lucide-react";
import { 
  getAllGuidanceRequests, suggestAlumni, assignAlumni, 
  updateRequestStatus, createSession 
} from "../../services/guidanceService"; 
import { formatDate } from "../../utils/formatDate";

const STATUS_TABS = [
  { id: "ALL", label: "All Requests" },
  { id: "PENDING_REVIEW", label: "Pending" },
  { id: "ALUMNI_CONTACTED", label: "Contacted" },
  { id: "ALUMNI_ACCEPTED", label: "Ready to Schedule" },
  { id: "SESSION_SCHEDULED", label: "Scheduled" },
];

const GuidanceInbox = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING_REVIEW");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [activeRequest, setActiveRequest] = useState(null);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === "ALL" ? "" : activeTab;
      const res = await getAllGuidanceRequests({ status: statusFilter, limit: 50 });
      setRequests(res.data.data?.requests || []);
    } catch (err) {
      toast.error("Failed to fetch guidance requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateRequestStatus(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const filteredRequests = requests.filter(req => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.requestedBy?.name?.toLowerCase().includes(query) ||
      req.targetCompanyName?.toLowerCase().includes(query) ||
      req.topic?.toLowerCase().includes(query)
    );
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <Inbox className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Guidance Inbox</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Review student mentorship requests, assign alumni, and schedule prep sessions.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, companies..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex overflow-x-auto hide-scrollbar space-x-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Request List */}
        <motion.div variants={itemVariants} className="min-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader text="Fetching guidance requests..." />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <CheckCircle2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Inbox Zero</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                There are no requests matching this status or search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredRequests.map((req) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={req._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Left details */}
                    <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={req.requestedBy?.avatar} name={req.requestedBy?.name} size="md" />
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">{req.requestedBy?.name}</h3>
                            <p className="text-xs font-medium text-gray-500">
                              {req.requestedBy?.academicStatus?.replace("_", " ")} • {formatDate(req.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          req.status === 'ALUMNI_CONTACTED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          req.status === 'ALUMNI_ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          req.status === 'SESSION_SCHEDULED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                          {req.targetCompany?.logo ? (
                            <img src={req.targetCompany.logo} alt="logo" className="w-5 h-5 object-contain" />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-400" />
                          )}
                          {req.targetCompanyName || req.targetCompany?.name} 
                          <span className="text-gray-400 font-normal text-sm">— {req.targetRole}</span>
                        </h4>
                        <p className="text-sm font-medium text-indigo-600 mb-2">Topic: {req.topic}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{req.description}</p>
                      </div>

                      {req.assignedAlumni && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned To:</span>
                          <Avatar src={req.assignedAlumni.avatar} name={req.assignedAlumni.name} size="sm" />
                          <span className="text-sm font-semibold text-gray-700">{req.assignedAlumni.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="p-6 md:w-64 bg-gray-50/50 flex flex-col justify-center gap-3">
                      {req.status === "PENDING_REVIEW" && (
                        <button
                          onClick={() => { setActiveRequest(req); setShowAlumniModal(true); }}
                          className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          <UserPlus className="w-4 h-4 mr-2" /> Find Alumni
                        </button>
                      )}

                      {req.status === "ALUMNI_CONTACTED" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(req._id, "ALUMNI_ACCEPTED")}
                            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Alumni Accepted
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req._id, "ALUMNI_DECLINED")}
                            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-lg text-red-700 bg-red-100 hover:bg-red-200 transition-colors shadow-sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Alumni Declined
                          </button>
                        </>
                      )}

                      {req.status === "ALUMNI_ACCEPTED" && (
                        <button
                          onClick={() => { setActiveRequest(req); setShowSessionModal(true); }}
                          className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          <CalendarPlus className="w-4 h-4 mr-2" /> Schedule Session
                        </button>
                      )}

                      {req.status === "SESSION_SCHEDULED" && (
                        <button
                          onClick={() => handleStatusUpdate(req._id, "COMPLETED")}
                          className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
                        </button>
                      )}

                      {!["COMPLETED", "CLOSED", "SESSION_SCHEDULED"].includes(req.status) && (
                        <button
                          onClick={() => handleStatusUpdate(req._id, "CLOSED")}
                          className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          Close Request
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Suggest/Assign Alumni Modal */}
      <AnimatePresence>
        {showAlumniModal && activeRequest && (
          <FindAlumniModal 
            request={activeRequest} 
            onClose={() => { setShowAlumniModal(false); setActiveRequest(null); }}
            onSuccess={() => { setShowAlumniModal(false); fetchRequests(); }}
          />
        )}
      </AnimatePresence>

      {/* Schedule Session Modal */}
      <AnimatePresence>
        {showSessionModal && activeRequest && (
          <CreateSessionModal 
            request={activeRequest} 
            onClose={() => { setShowSessionModal(false); setActiveRequest(null); }}
            onSuccess={() => { setShowSessionModal(false); fetchRequests(); }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

/* ── Modal: Find & Assign Alumni ────────────────────────────────────────── */
const FindAlumniModal = ({ request, onClose, onSuccess }) => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [officerNotes, setOfficerNotes] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await suggestAlumni(request._id);
        setAlumni(res.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch alumni suggestions");
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [request]);

  const handleAssign = async (alumniId) => {
    try {
      setAssigning(true);
      await assignAlumni(request._id, { alumniId, officerNotes });
      toast.success("Alumni assigned and notified!");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign alumni");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Find Alumni for Guidance</h3>
            <p className="text-sm text-gray-500">Matching experts for {request.targetCompanyName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader text="Finding the best matches..." />
            </div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No available alumni matches found for this request.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alumni.map((alum) => (
                <div key={alum._id} className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center ${alum.isRelevant ? 'border-indigo-200 bg-indigo-50/10' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar src={alum.avatar} name={alum.name} size="lg" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-bold text-gray-900">{alum.name}</h4>
                        {alum.isRelevant && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">Top Match</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" /> {alum.currentRole} @ {alum.currentCompany}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alum.program} • Class of {alum.graduationYear}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <button
                      onClick={() => handleAssign(alum._id)}
                      disabled={assigning}
                      className="w-full md:w-auto flex items-center justify-center px-5 py-2 text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                    >
                      Assign & Notify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-white flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">Officer Notes (Internal / Sent to Alumni)</label>
          <input 
            type="text"
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            placeholder="Add context before assigning..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </motion.div>
    </div>
  );
};

/* ── Modal: Schedule Session ────────────────────────────────────────────── */
const CreateSessionModal = ({ request, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setForm] = useState({
    title: `Prep: ${request.targetCompanyName} - ${request.topic}`,
    sessionType: request.preferredSessionType === "Either" ? "Mock Interview" : request.preferredSessionType,
    scheduledDate: "",
    startTime: "",
    durationMinutes: 60,
    meetingPlatform: "Google Meet",
    meetLink: "",
    description: `Mentorship session regarding ${request.topic}.`
  });

  const handleChange = (e) => setForm({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        alumniId: request.assignedAlumni?._id,
        studentIds: [request.requestedBy?._id],
        guidanceRequestIds: [request._id]
      };
      await createSession(payload);
      toast.success("Session scheduled successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Schedule Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar src={request.requestedBy?.avatar} name={request.requestedBy?.name} size="sm" className="ring-2 ring-white" />
              <Avatar src={request.assignedAlumni?.avatar} name={request.assignedAlumni?.name} size="sm" className="ring-2 ring-white" />
            </div>
            <p className="text-xs font-semibold text-indigo-800">
              Connecting <span className="font-bold">{request.requestedBy?.name}</span> with <span className="font-bold">{request.assignedAlumni?.name}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input required type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Mins)</label>
              <input required type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select name="meetingPlatform" value={formData.meetingPlatform} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (Optional)</label>
            <input type="url" name="meetLink" value={formData.meetLink} onChange={handleChange} placeholder="https://meet.google.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center">
              {loading && <Loader className="w-4 h-4 mr-2 animate-spin border-white" />} Schedule Session
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default GuidanceInbox;
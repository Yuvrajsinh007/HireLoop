import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { 
  Briefcase, Calendar, CheckCircle2, ChevronLeft, 
  Clock, FileText, GraduationCap,
  Rocket, Users, Loader2, IndianRupee, Info
} from "lucide-react";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const DriveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false); 

  useEffect(() => {
    const fetchDriveDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/drives/${id}`);
        setDrive(res.data.data);
      } catch (err) {
        toast.error("Failed to load drive details");
        navigate("/drives");
      } finally {
        setLoading(false);
      }
    };
    fetchDriveDetails();
  }, [id, navigate]);

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post(`/drives/${id}/apply`);
      toast.success("Application submitted successfully! 🚀");
      setHasApplied(true);
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Failed to apply.";
      toast.error(errMsg);
      if (errMsg.toLowerCase().includes("already applied")) {
        setHasApplied(true);
      }
    } finally {
      setApplying(false);
    }
  };

  // Smart Status Engine
  const getApplicationStatus = () => {
    if (hasApplied) return { isOpen: false, message: "Applied Successfully", type: "success" };
    if (drive.status === "UPCOMING") return { isOpen: false, message: "Applications will open soon. Stay tuned!", type: "info" };
    if (drive.status === "COMPLETED") return { isOpen: false, message: "This drive has been completed.", type: "error" };
    if (drive.status === "CANCELLED") return { isOpen: false, message: "This drive was cancelled.", type: "error" };
    if (drive.status === "DRAFT") return { isOpen: false, message: "This drive is still a draft.", type: "info" };
    if (drive.status !== "ACTIVE") return { isOpen: false, message: "Not accepting applications at this time.", type: "error" };

    if (drive.applicationDeadline) {
      const deadline = new Date(drive.applicationDeadline);
      deadline.setHours(23, 59, 59, 999); 
      if (new Date() > deadline) {
        return { isOpen: false, message: `Registration closed on ${formatDate(drive.applicationDeadline)}`, type: "error" };
      }
    }
    return { isOpen: true, message: "", type: "" };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Loading drive details..." />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!drive) return null;

  const statusObj = getApplicationStatus();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to List
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-8 flex flex-col md:flex-row md:items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-24 w-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {drive.company?.logo ? (
              <img src={drive.company.logo} alt={drive.company.name} className="h-full w-full object-contain p-2" />
            ) : (
              <Briefcase className="h-10 w-10 text-slate-300" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                {drive.company?.industry || "Technology"}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                drive.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                drive.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {drive.status}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{drive.title}</h1>
            <p className="text-lg font-medium text-slate-600">{drive.company?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {drive.description && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-500" /> Drive Overview
                </h2>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap shadow-sm">
                  {drive.description}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-500" /> Open Roles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {drive.roles?.map((role, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-200 transition-colors">
                    <h3 className="font-bold text-slate-900 mb-2">{role.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" /> {role.employmentType}
                      </div>
                      <div className="flex items-center text-sm font-bold text-emerald-600">
                        <IndianRupee className="w-4 h-4 mr-2 text-emerald-500" /> 
                        {role.ctcTotal ? `${role.ctcTotal} LPA` : "Not Disclosed"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {drive.rounds?.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-500" /> Selection Process
                </h2>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="space-y-6">
                    {drive.rounds.map((round, idx) => (
                      <div key={idx} className="flex items-start group">
                        <div className="flex flex-col items-center mr-4">
                          <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {idx + 1}
                          </div>
                          {idx !== drive.rounds.length - 1 && <div className="w-0.5 h-full bg-slate-100 mt-2 group-hover:bg-indigo-100 transition-colors"></div>}
                        </div>
                        <div className="pb-6 pt-1">
                          <h4 className="font-bold text-slate-900">{round.name}</h4>
                          {round.duration && <p className="text-sm text-slate-500 mt-1">Duration: {round.duration}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sticky Sidebar (Right Column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
              
              {/* Action Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Drive Date</p>
                    <p className="font-bold text-slate-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                      {drive.driveDate ? formatDate(drive.driveDate) : "To Be Announced"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Registration Closes</p>
                    <p className="font-bold text-red-600 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-red-500" />
                      {drive.applicationDeadline ? formatDate(drive.applicationDeadline) : "N/A"}
                    </p>
                  </div>
                </div>

                {statusObj.isOpen ? (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center"
                  >
                    {applying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Rocket className="w-5 h-5 mr-2" />}
                    {applying ? "Submitting..." : "Apply For Drive"}
                  </button>
                ) : (
                  <div className={`w-full font-bold py-3.5 px-4 rounded-xl flex items-start text-sm border shadow-sm ${
                    statusObj.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                    statusObj.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {statusObj.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" /> : <Info className="w-5 h-5 mr-3 shrink-0" />}
                    <span className="mt-0.5">{statusObj.message}</span>
                  </div>
                )}
                
                {hasApplied && (
                  <Link to="/journey" className="block text-center text-sm font-bold text-indigo-600 hover:text-indigo-800 mt-4">
                    Track Application Journey →
                  </Link>
                )}
              </div>

              {/* Eligibility Criteria Summary */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-500" /> Eligibility Criteria
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-600 font-medium">Min CGPA</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{drive.minCGPA || 0}+</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-600 font-medium">Max Backlogs</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{drive.maxBacklogs || 0}</span>
                  </li>
                  <li className="flex justify-between items-center pt-1">
                    <span className="text-slate-600 font-medium">Batches</span>
                    <span className="font-bold text-slate-900">{drive.graduationYears?.length > 0 ? drive.graduationYears.join(", ") : "All"}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriveDetail;
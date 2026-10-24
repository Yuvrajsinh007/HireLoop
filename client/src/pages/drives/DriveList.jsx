import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import { getDrives } from "../../services/driveService";
import { DRIVE_STATUS, DRIVE_TYPES } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { 
  Rocket, Calendar, Briefcase, ChevronLeft, 
  ChevronRight, Building2, ShieldAlert, GraduationCap 
} from "lucide-react";

const DriveList = () => {
  const { isCurrentStudent } = useAuth();

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getDrives({
          status,
          page,
          limit: 12,
        });
        setDrives(res.data.data?.drives || []);
        setTotal(res.data.data?.total || 0);
      } catch {
        toast.error("Failed to load drives");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [status, page]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case "ACTIVE": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "UPCOMING": return "bg-blue-50 text-blue-700 border-blue-200";
      case "COMPLETED": return "bg-slate-50 text-slate-700 border-slate-200";
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Animation variants
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
              <Rocket className="mr-3 h-6 w-6 text-indigo-600" />
              Placement Drives
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {isCurrentStudent ? "Browse drives you are eligible for" : "Manage all institutional placement drives"}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-8 w-fit">
          {[{ label: "All", value: "" }, ...DRIVE_STATUS].map((item) => (
            <button
              key={item.value || "all"}
              onClick={() => setStatus(item.value)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                status === item.value
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Loading & Empty States */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader size="lg" text="Loading drives..." />
          </div>
        ) : drives.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <ShieldAlert className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Drives Found</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              There are currently no drives matching this status. 
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="show" 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {drives.map((drive) => (
                  <Link key={drive._id} to={`/drives/${drive._id}`} className="block h-full">
                    <motion.div 
                      variants={itemVariants} 
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-full group"
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        
                        {/* Card Header (Logo & Status) */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {drive.company?.logo ? (
                              <img src={drive.company.logo} alt={drive.company.name} className="h-full w-full object-contain p-1 bg-white" />
                            ) : (
                              <Building2 className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(drive.status)}`}>
                            {drive.status}
                          </span>
                        </div>

                        {/* Title & Company */}
                        <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors" title={drive.title}>
                          {drive.title}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                          {drive.company?.name} • {drive.company?.industry}
                        </p>

                        {/* Job Roles Pills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {drive.roles?.slice(0, 2).map((role, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {role.title}
                            </span>
                          ))}
                          {drive.roles?.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                              +{drive.roles.length - 2} roles
                            </span>
                          )}
                        </div>

                        {/* Card Footer Info */}
                        <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span className="flex items-center">
                              <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              {DRIVE_TYPES.find((type) => type.value === drive.driveType)?.label || drive.driveType}
                            </span>
                            {drive.driveDate && (
                              <span className="flex items-center text-indigo-600">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                {formatDate(drive.driveDate)}
                              </span>
                            )}
                          </div>
                          
                          {drive.minCGPA > 0 && (
                            <div className="flex items-center text-xs text-slate-500 font-medium pt-1">
                              <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              Min CGPA: <span className="font-bold text-slate-700 ml-1">{drive.minCGPA}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  </Link>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            {total > 12 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </button>
                <span className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriveList;
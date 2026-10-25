import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Components
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import PlacementChart from "../../components/dashboard/PlacementChart";
import RecentActivity from "../../components/dashboard/RecentActivity";
import ProgressFunnel from "../../components/dashboard/ProgressFunnel";

// Services & Utils
import { useAuth } from "../../hooks/useAuth";
import { getDashboardStats, getMyApplications } from "../../services/memberService";
import { getEligibleDrives } from "../../services/driveService";
import { formatDate } from "../../utils/formatDate";
import { ACADEMIC_STATUS_LABELS } from "../../utils/constants";
import toast from "react-hot-toast";

// Icons
import { 
  Briefcase, CheckCircle2, Users, Award, 
  AlertTriangle, Rocket, ChevronRight, LayoutDashboard, 
  LineChart, FileText, UserRound, ArrowRight
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [eligibleDrives, setEligibleDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, appsRes, drivesRes] = await Promise.allSettled([
          getDashboardStats(),
          getMyApplications({ limit: 6 }),
          getEligibleDrives(),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        if (appsRes.status === "fulfilled") setApplications(appsRes.value.data.data?.applications || []);
        if (drivesRes.status === "fulfilled") setEligibleDrives(drivesRes.value.data.data || []);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = stats?.byStage ? Object.entries(stats.byStage).map(([stage, count]) => ({ stage, count })) : [];
  const funnelStats = {
    Applied: stats?.total || 0,
    Shortlisted: stats?.shortlisted || 0,
    Interview: stats?.interviews || 0,
    Offer: stats?.offers || 0,
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // Animation variants
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader size="lg" text="Preparing your workspace..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center">
              {getGreeting()}, <span className="text-indigo-600 ml-2">{user?.name?.split(" ")[0]}</span> !
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm font-medium text-slate-500">{formatDate(new Date())}</p>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                {ACADEMIC_STATUS_LABELS[user?.academicStatus] || "Student"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/drives" className="inline-flex items-center justify-center px-4 py-2.5 border border-slate-300 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              <Rocket className="w-4 h-4 mr-2 text-indigo-500" /> Browse Drives
            </Link>
            <Link to="/journey" className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Journey Tracker
            </Link>
          </div>
        </motion.div>

        {/* Email Verification Banner */}
        <AnimatePresence>
          {!user?.isEmailVerified && (
            <motion.div variants={itemVariants} exit={{ opacity: 0, height: 0 }} className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start sm:items-center gap-4 shadow-sm">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900">Email Verification Required</h3>
                <p className="text-sm text-amber-700 mt-0.5">Please verify <strong>{user?.email}</strong> to unlock full placement features.</p>
              </div>
              <Link to="/profile" className="px-4 py-2 bg-amber-200 text-amber-900 hover:bg-amber-300 text-sm font-bold rounded-lg transition-colors shrink-0">
                Verify Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Metric Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: "Total Applied", value: stats?.total ?? 0, icon: <Briefcase className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-100 border-blue-200" },
            { title: "Shortlisted", value: stats?.shortlisted ?? 0, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-100 border-emerald-200" },
            { title: "Interviews", value: stats?.interviews ?? 0, icon: <Users className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-100 border-amber-200" },
            { title: "Offers", value: stats?.offers ?? 0, icon: <Award className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-100 border-purple-200" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{stat.title}</p>
            </div>
          ))}
        </motion.div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center mb-6">
              <LineChart className="w-5 h-5 mr-2 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900">Application Analytics</h2>
            </div>
            <div className="h-72">
              <PlacementChart data={chartData} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Rocket className="w-5 h-5 mr-2 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900">Conversion Funnel</h2>
            </div>
            <div className="h-72 flex items-center justify-center">
              <ProgressFunnel stats={funnelStats} />
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <LayoutDashboard className="w-5 h-5 mr-2 text-indigo-500" /> Recent Activity
              </h2>
              <Link to="/journey" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                View full journey →
              </Link>
            </div>
            <div className="p-6 bg-slate-50/50">
              <RecentActivity applications={applications} />
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Eligible Drives Widget */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-indigo-500" /> Eligible Drives
                </h3>
                <Link to="/student/drives" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  View all
                </Link>
              </div>

              {eligibleDrives.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No active drives match your profile right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eligibleDrives.slice(0, 4).map((drive) => (
                    <Link key={drive._id} to={`/drives/${drive._id}`} className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {drive.company?.logo ? (
                          <img src={drive.company.logo} alt="logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-indigo-700 font-bold text-sm">{drive.company?.name?.[0] || "?"}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{drive.company?.name}</p>
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{drive.title}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions Widget */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: "/journey", icon: <LayoutDashboard className="w-4 h-4" />, label: "Track Applications" },
                  { to: "/experiences", icon: <FileText className="w-4 h-4" />, label: "Read Interview Experiences" },
                  { to: "/profile", icon: <UserRound className="w-4 h-4" />, label: "Update Profile & Resume" },
                ].map((action, idx) => (
                  <Link key={idx} to={action.to} className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all text-slate-700 hover:text-indigo-700">
                    <div className="flex items-center text-sm font-bold">
                      <span className="mr-3 text-slate-400 group-hover:text-indigo-500 transition-colors">{action.icon}</span>
                      {action.label}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
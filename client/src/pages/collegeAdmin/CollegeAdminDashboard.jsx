import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatsCard from "../../components/dashboard/StatsCard";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { 
  Building2, Globe, GraduationCap, BookOpen, 
  Settings, Users, ShieldCheck, AlertCircle, ArrowRight
} from "lucide-react";
import api from "../../services/api"; // Adjust depending on your service structure

const CollegeAdminDashboard = () => {
  const [data, setData] = useState({
    institution: null,
    domains: [],
    academicUnits: [],
    programs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetching configuration data simultaneously 
        const [instRes, domRes, unitsRes, progRes] = await Promise.all([
          api.get("/institutions/me"),
          api.get("/institutions/domains"),
          api.get("/institutions/academic-units"),
          api.get("/institutions/programs")
        ]);

        setData({
          institution: instRes.data.data,
          domains: domRes.data.data || [],
          academicUnits: unitsRes.data.data || [],
          programs: progRes.data.data || []
        });
      } catch (err) {
        toast.error("Failed to load institution dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading institution configuration..." />
      </div>
    </DashboardLayout>
  );

  const { institution, domains, academicUnits, programs } = data;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Building2 className="w-64 h-64 text-indigo-900" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl border-2 border-indigo-50 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
              {institution?.logo ? (
                <img src={institution.logo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 className="w-10 h-10 text-indigo-300" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {institution?.name || "Institution Name"}
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  institution?.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {institution?.status || "Pending"}
                </span>
              </div>
              <p className="text-base font-medium text-gray-500 mb-4 max-w-2xl">
                {institution?.description || "Manage your institution's academic structure, placement officers, and email domains."}
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                {institution?.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                      {institution.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {institution?.type && (
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <span className="capitalize">{institution.type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Verified Domains"  
            value={domains.length} 
            icon={<Globe className="w-5 h-5 text-blue-600" />} 
            color="blue"
            subtitle="Allowed for registration"
          />
          <StatsCard 
            title={institution?.academicUnitLabel || "Academic Units"}
            value={academicUnits.length} 
            icon={<Building2 className="w-5 h-5 text-indigo-600" />} 
            color="indigo" 
            subtitle="Active departments/institutes"
          />
          <StatsCard 
            title={institution?.programLabel || "Programs"}
            value={programs.length} 
            icon={<BookOpen className="w-5 h-5 text-emerald-600" />} 
            color="emerald"
            subtitle="Degree courses offered"
          />
          <StatsCard 
            title="Placement Officers"  
            value={"Manage"} // We will fetch actual count in ManageStaff.jsx
            icon={<Users className="w-5 h-5 text-amber-600" />} 
            color="amber" 
            subtitle="Authorized staff members"
          />
        </motion.div>

        {/* Configurations & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Institution Setup & Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">Navigate to specific configuration modules</p>
            </div>
            <div className="divide-y divide-gray-50">
              
              <Link to="/college-admin/structure" className="flex items-center justify-between p-6 hover:bg-indigo-50/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Academic Structure</h4>
                    <p className="text-sm font-medium text-gray-500">Configure {institution?.academicUnitLabel?.toLowerCase() || "institutes"} and {institution?.programLabel?.toLowerCase() || "programs"}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1" />
              </Link>

              <Link to="/college-admin/staff" className="flex items-center justify-between p-6 hover:bg-indigo-50/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Manage Staff</h4>
                    <p className="text-sm font-medium text-gray-500">Invite placement officers and manage permissions</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors transform group-hover:translate-x-1" />
              </Link>

              <div className="flex items-center justify-between p-6 hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => toast("Institution Settings modal coming soon!")}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">General Settings</h4>
                    <p className="text-sm font-medium text-gray-500">Update naming conventions, logo, and contact info</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-600 transition-colors transform group-hover:translate-x-1" />
              </div>

            </div>
          </motion.div>

          {/* Email Domains Overview */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Approved Email Domains</h3>
                <p className="text-sm text-gray-500 mt-1">Domains allowed for student registration</p>
              </div>
              <button 
                onClick={() => toast("Domain management is handled via Institution Settings")}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Manage
              </button>
            </div>
            <div className="p-6 flex-1 bg-gray-50/30">
              {domains.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
                  <p className="text-sm font-bold text-gray-900">No Domains Configured</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">Students cannot register until you authorize an official email domain (e.g., @college.edu).</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {domains.map((domain) => (
                    <div key={domain._id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">@{domain.domain}</p>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                            Allowed for: {domain.allowedFor.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CollegeAdminDashboard;
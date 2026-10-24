import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import ExperienceCard from "../../components/experience/ExperienceCard";
import api from "../../services/api";
import { getByCompany } from "../../services/experienceService";
import toast from "react-hot-toast";
import { 
  Building2, MapPin, Globe, Briefcase, 
  ChevronLeft, FileText, ExternalLink 
} from "lucide-react";

const CompanyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        // Fetch company details and experiences simultaneously
        const [companyRes, expRes] = await Promise.all([
          api.get(`/companies/${id}`),
          getByCompany(id)
        ]);
        
        setCompany(companyRes.data.data);
        setExperiences(expRes.data.data || []);
      } catch (err) {
        toast.error("Failed to load company details");
        navigate("/companies");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Loading company profile..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!company) return null;

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
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Directory
        </button>

        {/* Company Header Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-2 bg-white" />
              ) : (
                <Building2 className="w-10 h-10 text-slate-300" />
              )}
            </div>
            
            <div className="pt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                {company.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500 mb-4">
                {company.industry && (
                  <>
                    <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5 text-slate-400" /> {company.industry}</span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                  </>
                )}
                {company.headquarters && (
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> {company.headquarters}</span>
                )}
              </div>

              <div className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> {experiences.length} Experiences
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs (Apply Tab Removed) */}
        <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto hide-scrollbar bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-8 w-fit">
          {["overview", "experiences"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab === "experiences" ? `Experiences (${experiences.length})` : tab}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4">About {company.name}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base mb-8">
                {company.description || "No description provided for this company."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.website && (
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
                    <Globe className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mr-3 shrink-0 transition-colors" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Website</p>
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-700">{company.website}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                )}
                
                {company.headquarters && (
                  <div className="flex items-center p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Headquarters</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{company.headquarters}</p>
                    </div>
                  </div>
                )}

                {company.industry && (
                  <div className="flex items-center p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <Briefcase className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Industry</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{company.industry}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "experiences" && (
            <motion.div 
              key="experiences"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
              {experiences.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20 text-slate-400 shadow-sm border-dashed">
                  <FileText className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="text-lg font-bold text-slate-900 mb-1">No Experiences Yet</p>
                  <p className="text-sm font-medium text-slate-500 text-center max-w-sm">
                    No students have shared their interview experience for {company.name} yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {experiences.map((exp) => (
                    <ExperienceCard key={exp._id} experience={exp} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  );
};

export default CompanyPage;
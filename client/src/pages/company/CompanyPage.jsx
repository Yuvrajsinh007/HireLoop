import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import CompanyDetail from "../../components/company/CompanyDetail";
import ExperienceCard from "../../components/experience/ExperienceCard";
import Loader from "../../components/common/Loader";
import { getCompany, getCompanyDrives } from "../../services/companyService";
import { getByCompany } from "../../services/experienceService";
import { addApplication } from "../../services/memberService";
import toast from "react-hot-toast";
import { Building2, ArrowLeft, ClipboardList, FileText, Loader2 } from "lucide-react";

const TABS = ["Overview", "Experiences", "Apply"];

const CompanyPage = () => {
  const { id } = useParams();
  const [company, setCompany]         = useState(null);
  const [drives, setDrives]           = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("Overview");
  const [applying, setApplying]       = useState(false);
  const [role, setRole]               = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [compRes, driveRes, expRes] = await Promise.allSettled([
          getCompany(id),
          getCompanyDrives(id),
          getByCompany(id),
        ]);
        if (compRes.status  === "fulfilled") setCompany(compRes.value.data.data);
        if (driveRes.status === "fulfilled") setDrives(driveRes.value.data.data || []);
        if (expRes.status   === "fulfilled") setExperiences(expRes.value.data.data || []);
      } catch {
        toast.error("Failed to load company");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleQuickApply = async (e) => {
    e.preventDefault();
    if (!role.trim()) return toast.error("Please enter the role");
    try {
      setApplying(true);
      await addApplication({ companyId: id, role });
      toast.success("Application added to your Journey Tracker!");
      setRole("");
      setActiveTab("Overview");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <Loader />
    </DashboardLayout>
  );

  if (!company) return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium mb-6">Company not found</p>
        <Link to="/companies" className="bg-brand-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>
      </div>
    </DashboardLayout>
  );

  const upcomingDrive = drives.find((d) => d.status === "UPCOMING" || d.status === "ACTIVE");

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider">
          <Link to="/companies" className="hover:text-brand-600 transition-colors">Companies</Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{company.name}</span>
        </div>

        {/* Company Hero */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              {company.logo ? (
                <img src={company.logo} alt={company.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-3xl font-bold text-brand-700 shadow-sm">
                  {company.name?.[0]}
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1">{company.name}</h1>
                <p className="text-gray-500 font-medium">{company.industry || "Other"} · {company.headquarters || "India"}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {upcomingDrive && (
                    <span className="badge uppercase tracking-wider font-bold shadow-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {upcomingDrive.status === "ACTIVE" ? "Drive Active" : "Drive Upcoming"}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                    <FileText className="w-3.5 h-3.5" />
                    {experiences.length} experience{experiences.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("Apply")}
              className="w-full md:w-auto bg-brand-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              <ClipboardList className="w-5 h-5" /> Track Application
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 mb-8 w-full md:w-fit overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-900 border border-transparent"
                }`}
            >
              {tab === "Experiences" ? `${tab} (${experiences.length})` : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[40vh]">
          {activeTab === "Overview" && <CompanyDetail company={company} drives={drives} />}

          {activeTab === "Experiences" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-bold text-gray-900 text-xl">
                  Interview Experiences <span className="text-gray-400">({experiences.length})</span>
                </h2>
                <Link to="/experiences" className="text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-lg transition-colors">
                  Write Experience →
                </Link>
              </div>

              {experiences.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400 shadow-sm">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-base font-bold text-gray-900 mb-1">No experiences shared yet</p>
                  <p className="text-sm font-medium">Be the first to share your experience with {company.name}!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {experiences.map((exp) => (
                    <ExperienceCard key={exp._id} experience={exp} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Apply" && (
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-xl animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-gray-900 text-xl">Track Application</h2>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-8">
                Add this company to your Journey Tracker to monitor your progress.
              </p>

              <form onSubmit={handleQuickApply} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Job Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    placeholder="e.g. Software Engineer, Full Stack Developer"
                  />
                </div>
                <button type="submit" disabled={applying} className="w-full bg-brand-600 text-white font-medium py-3 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center justify-center shadow-sm">
                  {applying ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Adding...
                    </span>
                  ) : (
                    "Add to Journey Tracker"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyPage;
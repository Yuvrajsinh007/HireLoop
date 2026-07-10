import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import CompanyDetail from "../../components/company/CompanyDetail";
import ExperienceCard from "../../components/experience/ExperienceCard";
import Loader from "../../components/common/Loader";
import { getCompany } from "../../services/companyService";
import { getByCompany } from "../../services/experienceService";
import { addApplication } from "../../services/studentService";
import { useAuth } from '../../hooks/useAuth';
import toast from "react-hot-toast";

const TABS = ["Overview", "Experiences", "Apply"];

const CompanyPage = () => {
  const { id }    = useParams();
  const { user }  = useAuth();
  const [company, setCompany]         = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("Overview");
  const [applying, setApplying]       = useState(false);
  const [role, setRole]               = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [compRes, expRes] = await Promise.allSettled([
          getCompany(id),
          getByCompany(id),
        ]);
        if (compRes.status === "fulfilled") setCompany(compRes.value.data.data);
        if (expRes.status  === "fulfilled") setExperiences(expRes.value.data.data || []);
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
      toast.success("Application added to your Journey Tracker! 🎉");
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
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" text="Loading company..." />
      </div>
    </DashboardLayout>
  );

  if (!company) return (
    <DashboardLayout>
      <div className="page-wrapper text-center py-24">
        <div className="text-4xl mb-4">🏢</div>
        <p className="text-gray-500">Company not found</p>
        <Link to="/companies" className="btn-primary mt-4 inline-block">← Back to Companies</Link>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link to="/companies" className="hover:text-indigo-600 transition-colors">Companies</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{company.name}</span>
        </div>

        {/* Company Hero */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {company.logo ? (
                <img src={company.logo} alt={company.name}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700">
                  {company.name?.[0]}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-400 text-sm">{company.domain} · {company.headquarters || "India"}</p>
                <div className="flex items-center gap-2 mt-1">
                  {company.driveStatus !== "none" && (
                    <span className={`badge capitalize text-xs ${
                      company.driveStatus === "upcoming" ? "badge-indigo" :
                      company.driveStatus === "ongoing"  ? "badge-green" : "badge-gray"
                    }`}>
                      {company.driveStatus}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {experiences.length} experience{experiences.length !== 1 ? "s" : ""} shared
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("Apply")}
              className="btn-primary flex items-center gap-2"
            >
              📋 Track Application
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab === "Experiences" ? `${tab} (${experiences.length})` : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && <CompanyDetail company={company} />}

        {activeTab === "Experiences" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-lg">
                Interview Experiences ({experiences.length})
              </h2>
              <Link to="/experiences" className="text-sm text-indigo-600 hover:underline">
                Write Experience →
              </Link>
            </div>

            {experiences.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm">No experiences shared yet</p>
                <p className="text-xs mt-1">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <ExperienceCard key={exp._id} experience={exp} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Apply" && (
          <div className="card max-w-md">
            <h2 className="font-bold text-gray-800 text-lg mb-1">Track Your Application</h2>
            <p className="text-sm text-gray-500 mb-5">
              Add this company to your Journey Tracker to monitor your progress.
            </p>
            <form onSubmit={handleQuickApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Software Engineer, Full Stack Developer"
                />
              </div>
              <button type="submit" disabled={applying} className="btn-primary w-full py-3">
                {applying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  "Add to Journey Tracker 📋"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyPage;
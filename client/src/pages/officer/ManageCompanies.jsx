import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";
import { 
  Building2, Search, Plus, MapPin, Globe, 
  Edit2, UploadCloud, X, Loader2, Filter
} from "lucide-react";
import api from "../../services/api"; // Adjust depending on your service structure

const INDUSTRIES = [
  "Product", "Service", "FinTech", "EdTech", "HealthTech", 
  "E-Commerce", "Consulting", "Core Engineering", 
  "Banking & Finance", "Government / PSU", "Startup", "Other"
];

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCompanies();
  }, [page, debouncedSearch, industryFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (industryFilter) params.industry = industryFilter;

      const res = await api.get("/companies", { params });
      setCompanies(res.data.data?.companies || []);
      setTotalPages(res.data.data?.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (company = null) => {
    setEditingCompany(company);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingCompany(null);
    setShowModal(false);
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Global Company Directory</h1>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Manage the central database of recruiting organizations available to all institutions.
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-indigo-600 text-white font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Company
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by company name or description..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="relative min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[50vh]">
          {loading && companies.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader text="Loading directory..." />
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Companies Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                No organizations match your search or filter criteria. Add a new company to expand the directory.
              </p>
            </div>
          ) : (
            <>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {companies.map((company) => (
                  <motion.div 
                    key={company._id} 
                    variants={itemVariants}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden"
                  >
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {company.logo ? (
                            <img src={company.logo} alt={`${company.name} logo`} className="w-full h-full object-contain p-2" />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenModal(company)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit Company"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate" title={company.name}>
                        {company.name}
                      </h3>
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider mb-3">
                        {company.industry}
                      </span>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                        {company.description || "No description provided."}
                      </p>

                      <div className="space-y-2">
                        {company.headquarters && (
                          <div className="flex items-center text-xs text-gray-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" />
                            <span className="truncate">{company.headquarters}</span>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center text-xs text-gray-500 font-medium">
                            <Globe className="w-3.5 h-3.5 mr-2 text-gray-400" />
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline truncate">
                              {company.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-600 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Company Modal */}
      <AnimatePresence>
        {showModal && (
          <CompanyModal 
            company={editingCompany} 
            onClose={handleCloseModal}
            onSuccess={() => {
              handleCloseModal();
              fetchCompanies();
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

/* ── Company Form & Logo Upload Modal ────────────────────────────────────── */
const CompanyModal = ({ company, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setForm] = useState({
    name: company?.name || "",
    industry: company?.industry || "Other",
    website: company?.website || "",
    headquarters: company?.headquarters || "",
    description: company?.description || "",
  });

  const handleChange = (e) => setForm({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (company) {
        await api.put(`/companies/${company._id}`, formData);
        toast.success("Company updated successfully!");
      } else {
        await api.post("/companies", formData);
        toast.success("Company added to directory!");
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !company) return; // Must create company before uploading logo
    
    const fd = new FormData();
    fd.append("image", file); // Depending on your uploadMiddleware field name, usually 'image' or 'logo'
    
    try {
      setUploadingLogo(true);
      await api.post(`/companies/${company._id}/logo`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Logo uploaded successfully!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            {company ? "Edit Company Details" : "Add New Company"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {company && (
            <div className="flex items-center gap-5 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                {company.logo ? (
                  <img src={company.logo} alt="logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Company Logo</p>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-1.5" />}
                  {uploadingLogo ? "Uploading..." : "Upload New Logo"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
          )}

          {!company && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
              <span className="font-semibold">Note:</span> You can upload the company logo after saving the initial details.
            </div>
          )}

          <form id="company-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="e.g. Google" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters</label>
                <input type="text" name="headquarters" value={formData.headquarters} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="City, Country" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" 
                placeholder="Brief overview of the company..."
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button type="submit" form="company-form" disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {company ? "Save Changes" : "Add Company"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageCompanies;
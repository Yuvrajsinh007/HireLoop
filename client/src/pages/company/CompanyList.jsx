import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import CompanyCard from "../../components/company/CompanyCard";
import Loader from "../../components/common/Loader";
import { getCompanies } from "../../services/companyService";
import { COMPANY_INDUSTRIES } from "../../utils/constants";
import toast from "react-hot-toast";
import { Search, X, Building2, ChevronLeft, ChevronRight } from "lucide-react";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [industry, setIndustry]   = useState("");

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCompanies({ page, limit: 12, industry, search });
      setCompanies(res.data.data?.companies || []);
      setTotal(res.data.data?.total || 0);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [page, industry, search]);

  useEffect(() => {
    const timer = setTimeout(fetchCompanies, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchCompanies, search]);

  useEffect(() => { setPage(1); }, [search, industry]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">Company Directory</h1>
          <p className="text-sm font-medium text-gray-500">
            Browse companies on the platform and explore their placement drives at your college.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            {/* Industry filter */}
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all min-w-[160px]"
            >
              <option value="">All Industries</option>
              {COMPANY_INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>

            {/* Clear filters */}
            {(search || industry) && (
              <button
                onClick={() => { setSearch(""); setIndustry(""); }}
                className="text-sm font-semibold text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 px-2"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {loading ? "Loading..." : `${total} ${total === 1 ? "company" : "companies"} found`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader />
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-gray-400 shadow-sm">
            <Building2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-bold text-gray-900 mb-1">No companies found</p>
            <p className="text-sm font-medium">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-white border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-gray-600 font-bold bg-gray-100 px-4 py-2 rounded-lg">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="bg-white border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyList;
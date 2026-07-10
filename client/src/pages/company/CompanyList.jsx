import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import CompanyCard from "../../components/company/CompanyCard";
import Loader from "../../components/common/Loader";
import { getCompanies } from "../../services/companyService";
import { COMPANY_DOMAINS } from "../../utils/constants";
import toast from "react-hot-toast";

const DRIVE_FILTERS = [
  { label: "All",       value: ""          },
  { label: "Upcoming",  value: "upcoming"  },
  { label: "Ongoing",   value: "ongoing"   },
  { label: "Completed", value: "completed" },
];

const CompanyList = () => {
  const [companies, setCompanies]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [domain, setDomain]         = useState("");
  const [driveStatus, setDriveStatus] = useState("");

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCompanies({ page, limit: 12, domain, driveStatus, search });
      setCompanies(res.data.data?.companies || []);
      setTotal(res.data.data?.total || 0);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [page, domain, driveStatus, search]);

  useEffect(() => {
    const timer = setTimeout(fetchCompanies, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchCompanies, search]);

  useEffect(() => { setPage(1); }, [search, domain, driveStatus]);

  return (
    <DashboardLayout>
      <div className="page-wrapper fade-in">

        {/* Header */}
        <div className="mb-6">
          <h1 className="section-title mb-1">Company Intelligence Hub</h1>
          <p className="text-sm text-gray-500">
            Browse companies, check round details, and find your perfect match
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="input-field pl-9"
              />
            </div>

            {/* Domain filter */}
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="input-field w-auto min-w-36"
            >
              <option value="">All Domains</option>
              {COMPANY_DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Drive status tabs */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              {DRIVE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setDriveStatus(f.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${driveStatus === f.value
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {(search || domain || driveStatus) && (
              <button
                onClick={() => { setSearch(""); setDomain(""); setDriveStatus(""); }}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${total} ${total === 1 ? "company" : "companies"} found`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader size="lg" text="Loading companies..." />
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🏢</div>
            <p className="text-lg font-medium text-gray-500">No companies found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyList;
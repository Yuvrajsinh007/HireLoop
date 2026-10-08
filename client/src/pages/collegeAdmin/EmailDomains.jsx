import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { Plus, Trash2, CheckCircle2, Globe, AlertCircle, Loader2 } from "lucide-react";
import { getDomains, addDomain, removeDomain, verifyDomain } from "../../services/collegeAdminService";

const EmailDomains = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await getDomains();
      setDomains(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch domains");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    try {
      setSubmitting(true);
      const res = await addDomain({ domain: newDomain.trim() });
      setDomains([...domains, res.data.data]);
      setNewDomain("");
      toast.success("Domain added successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add domain");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveDomain = async (id) => {
    if (!window.confirm("Are you sure you want to remove this domain?")) return;
    try {
      await removeDomain(id);
      setDomains(domains.filter(d => d._id !== id));
      toast.success("Domain removed");
    } catch (err) {
      toast.error("Failed to remove domain");
    }
  };

  const handleVerifyDomain = async (id) => {
    try {
      const res = await verifyDomain(id);
      setDomains(domains.map(d => (d._id === id ? res.data.data : d)));
      toast.success("Domain verified");
    } catch (err) {
      toast.error("Failed to verify domain");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <Globe className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Domains</h1>
            <p className="text-sm text-gray-500">Manage approved email domains for your institution.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleAddDomain} className="flex gap-4">
            <input
              type="text"
              placeholder="e.g. college.edu"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Domain
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader text="Loading domains..." />
            </div>
          ) : domains.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Domains Found</h3>
              <p className="text-sm text-gray-500">Add an email domain to restrict registrations.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {domains.map((domain) => (
                <li key={domain._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-md font-medium text-gray-900">{domain.domain}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {domain.isVerified ? (
                        <span className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="w-3 h-3 mr-1" /> Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!domain.isVerified && (
                      <button
                        onClick={() => handleVerifyDomain(domain._id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveDomain(domain._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmailDomains;

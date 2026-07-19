import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerInstitution } from "../../services/superAdminService";
import { INSTITUTION_TYPES, INDIAN_STATES } from "../../utils/constants";
import { Loader2, Building2, CheckCircle2 } from "lucide-react";

const DEFAULT_FORM = {
  name: "", shortName: "", type: "University", website: "", description: "",
  contactEmail: "", contactPhone: "",
  address: { city: "", state: "", country: "India" },
  primaryAdminName: "", primaryAdminEmail: "", primaryAdminPassword: "",
  domainsRaw: "",
};

const RegisterInstitution = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((p) => ({ ...p, address: { ...p.address, [key]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())              return toast.error("Institution name is required");
    if (!form.contactEmail.trim())      return toast.error("Contact email is required");
    if (!form.primaryAdminEmail.trim()) return toast.error("Primary admin email is required");
    if (form.primaryAdminPassword.length < 6)
      return toast.error("Admin password must be at least 6 characters");

    const domains = form.domainsRaw
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    if (domains.length === 0)
      return toast.error("Enter at least one official student/alumni email domain");

    try {
      setLoading(true);
      await registerInstitution({
        name: form.name,
        shortName: form.shortName,
        type: form.type,
        website: form.website,
        description: form.description,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        address: form.address,
        primaryAdminName: form.primaryAdminName,
        primaryAdminEmail: form.primaryAdminEmail,
        primaryAdminPassword: form.primaryAdminPassword,
        domains,
      });
      setSubmitted(true);
      toast.success("Registration submitted! Awaiting platform approval.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit registration");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Registration submitted</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your college's registration is pending review by the HireLoop platform team.
            You'll be notified at <strong>{form.primaryAdminEmail}</strong> once it's approved,
            and your students will be able to register with their institutional email after that.
          </p>
          <Link to="/login" className="inline-block bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">HireLoop</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Register Your College</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Bring your placement office, students, and alumni onto HireLoop.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Institution Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Institution Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">College / University Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Charotar University of Science and Technology" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Name</label>
                <input name="shortName" value={form.shortName} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. CHARUSAT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input name="website" value={form.website} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="https://www.yourcollege.edu.in" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input name="address.city" value={form.address.city} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <select name="address.state" value={form.address.state} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Domains */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Official Email Domain(s)</h3>
            <input name="domainsRaw" value={form.domainsRaw} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. charusat.edu.in, charusat.ac.in" />
            <p className="text-xs text-gray-400 mt-1.5">Comma-separated. Students/alumni will register using these domains.</p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Placement Office Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email <span className="text-red-500">*</span></label>
                <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
          </div>

          {/* Primary Admin */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Primary College Admin Account</h3>
            <p className="text-xs text-gray-400 mb-3">This account will manage your college on HireLoop once approved.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Full Name</label>
                <input name="primaryAdminName" value={form.primaryAdminName} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email <span className="text-red-500">*</span></label>
                <input type="email" name="primaryAdminEmail" value={form.primaryAdminEmail} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Password <span className="text-red-500">*</span></label>
                <input type="password" name="primaryAdminPassword" value={form.primaryAdminPassword} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Min. 6 characters" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Approval"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already registered? <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterInstitution;
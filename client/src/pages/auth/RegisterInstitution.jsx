import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerInstitution } from "../../services/superAdminService";
import { INSTITUTION_TYPES, INDIAN_STATES } from "../../utils/constants";
import Navbar from "../../components/common/Navbar";
import {
  Loader2, Building2, CheckCircle2, School, Globe, FileText,
  MapPin, Landmark, AtSign, Phone, User, Lock, Mail, Eye, EyeOff,
  ShieldCheck, ArrowRight, Sparkles,
} from "lucide-react";

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
  const [showPw, setShowPw] = useState(false);

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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registration submitted</h2>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              Your college's registration is pending review by the HireLoop platform team.
              You'll be notified at <strong className="text-gray-700">{form.primaryAdminEmail}</strong> once it's approved,
              and your students will be able to register with their institutional email after that.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20">
              Back to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 mb-5">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Register Your College</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              Bring your placement office, students, and alumni onto HireLoop.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
            {/* Institution Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <School className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Institution Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">College / University Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Landmark className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input name="name" value={form.name} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="e.g. Charotar University of Science and Technology" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Name</label>
                  <input name="shortName" value={form.shortName} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="e.g. CHARUSAT" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                  <select name="type" value={form.type} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all">
                    {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input name="website" value={form.website} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="https://www.yourcollege.edu.in" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all resize-none"
                      placeholder="Brief description of your institution (optional)" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input name="address.city" value={form.address.city} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                  <select name="address.state" value={form.address.state} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all">
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Domains */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Official Email Domain(s)</h3>
              </div>
              <div className="relative">
                <AtSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input name="domainsRaw" value={form.domainsRaw} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. charusat.edu.in, charusat.ac.in" />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Comma-separated. Students/alumni will register using these domains.</p>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Placement Office Contact</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input name="contactPhone" value={form.contactPhone} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Admin */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Primary College Admin Account</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-4">This account will manage your college on HireLoop once approved.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input name="primaryAdminName" value={form.primaryAdminName} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="email" name="primaryAdminEmail" value={form.primaryAdminEmail} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type={showPw ? "text" : "password"} name="primaryAdminPassword" value={form.primaryAdminPassword} onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit for Approval <Sparkles className="w-4 h-4" /></>}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already registered? <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterInstitution;
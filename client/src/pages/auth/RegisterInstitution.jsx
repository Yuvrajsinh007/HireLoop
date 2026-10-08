import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import API from "../../services/api" // Ensure you import your API service

const RegisterInstitution = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    institutionName: "",
    shortName: "",
    domain: "",
    contactName: "",
    officialEmail: "",
    phoneNumber: "",
  });

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      // Connects to your backend institution registration endpoint
      await API.post("/institutions/register", formData);
      setSubmitted(true);
      toast.success("Institution registration request submitted successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit institution request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-lg flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/15">
            <Building2 className="h-7 w-7 text-amber-400" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            Institution partnerships
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Bring HireLoop to campus
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Request a verified workspace and map your institutional email domain.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5"
        >
          {submitted ? (
            <div className="p-8 text-center sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                Request received
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                Our team will review your domain registration and contact you at{" "}
                <strong className="font-bold text-slate-700">
                  {formData.officialEmail}
                </strong>{" "}
                upon activation.
              </p>

              <Link
                to="/"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"
              >
                Return to home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 bg-amber-50/70 px-6 py-4 sm:px-8">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                  <div>
                    <p className="text-sm font-bold text-amber-950">
                      Domain mapping required
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Provide your official web domain (e.g., ctu.edu) so students logging in with that suffix match your portal automatically.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
                <div>
                  <label htmlFor="institutionName" className="block text-sm font-bold text-slate-700">
                    Institution name
                  </label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="institutionName"
                      name="institutionName"
                      type="text"
                      required
                      value={formData.institutionName}
                      onChange={handleChange}
                      placeholder="e.g. California Tech University"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="shortName" className="block text-sm font-bold text-slate-700">
                      Short Code / Acronym
                    </label>
                    <input
                      id="shortName"
                      name="shortName"
                      type="text"
                      required
                      value={formData.shortName}
                      onChange={handleChange}
                      placeholder="e.g. CTU"
                      className="w-full mt-2 rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>

                  <div>
                    <label htmlFor="domain" className="block text-sm font-bold text-slate-700">
                      Email Domain Suffix
                    </label>
                    <div className="relative mt-2">
                      <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="domain"
                        name="domain"
                        type="text"
                        required
                        value={formData.domain}
                        onChange={handleChange}
                        placeholder="ctu.edu"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="contactName" className="block text-sm font-bold text-slate-700">
                    Contact person
                  </label>
                  <div className="relative mt-2">
                    <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="contactName"
                      name="contactName"
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="officialEmail" className="block text-sm font-bold text-slate-700">
                    Official work email
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="officialEmail"
                      name="officialEmail"
                      type="email"
                      required
                      value={formData.officialEmail}
                      onChange={handleChange}
                      placeholder="admin@ctu.edu"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-bold text-slate-700">
                    Phone number <span className="font-medium text-slate-400">(optional)</span>
                  </label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+1 (555) 019-2834"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting request
                    </>
                  ) : (
                    <>
                      Request platform access
                      <ClipboardCheck className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center sm:px-8">
                <p className="text-sm text-slate-500">
                  Already registered?{" "}
                  <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800">
                    Create a student profile
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default RegisterInstitution;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { submitGuidanceRequest } from "../../services/guidanceService";
import { searchCompanies } from "../../services/companyService";
import { GUIDANCE_TOPICS } from "../../utils/constants";
import toast from "react-hot-toast";

const RequestGuidance = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    targetCompany: "",
    targetCompanyName: "",
    targetRole: "",
    topic: "Interview Preparation",
    description: "",
    preferredSessionType: "Either",
  });

  const [companySearch, setCompanySearch] = useState("");
  const [companies, setCompanies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companySearch.length < 2) {
      setCompanies([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchCompanies(companySearch);
        setCompanies(res.data.data || []);
        setShowDropdown(true);
      } catch {}
    }, 300);

    return () => clearTimeout(timer);
  }, [companySearch]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectCompany = (company) => {
    setForm((prev) => ({
      ...prev,
      targetCompany: company._id,
      targetCompanyName: company.name,
    }));

    setCompanySearch(company.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.description.trim() ||
      form.description.length < 20
    ) {
      return toast.error(
        "Please describe what you need help with (min 20 characters)"
      );
    }

    try {
      setLoading(true);

      await submitGuidanceRequest(form);

      toast.success(
        "Guidance request submitted! The placement office will reach out soon. 🎉"
      );

      navigate("/guidance/my");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to submit request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">
          Request Guidance 🤝
        </h1>

        <p className="text-sm text-gray-500">
          Submit a request and the placement office will
          connect you with a suitable alumni mentor.
        </p>
      </div>

      {/* Info Card */}
      <div className="card bg-indigo-50 border-indigo-100 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>

          <div>
            <p className="text-sm font-semibold text-indigo-800">
              How it works
            </p>

            <ol className="text-xs text-indigo-700 mt-1 space-y-0.5 list-decimal list-inside">
              <li>You submit a guidance request</li>
              <li>
                Placement officer reviews and identifies a
                suitable alumni
              </li>
              <li>
                Officer contacts the alumni on your behalf
              </li>
              <li>
                If alumni agrees, a session is scheduled for
                you
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Company (optional)
            </label>

            <div className="relative">
              <input
                type="text"
                value={companySearch}
                className="input-field"
                placeholder="Search for a company..."
                onChange={(e) => {
                  setCompanySearch(e.target.value);

                  setForm((prev) => ({
                    ...prev,
                    targetCompany: "",
                    targetCompanyName: e.target.value,
                  }));
                }}
                onFocus={() =>
                  companies.length > 0 &&
                  setShowDropdown(true)
                }
              />

              {showDropdown &&
                companies.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 overflow-hidden">
                    {companies.map((company) => (
                      <button
                        key={company._id}
                        type="button"
                        onClick={() =>
                          handleSelectCompany(company)
                        }
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                          {company.name?.[0]}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {company.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {company.industry}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {form.targetCompany && (
              <p className="text-xs text-indigo-600 mt-1">
                ✓ Selected: {form.targetCompanyName}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Role
            </label>

            <input
              name="targetRole"
              value={form.targetRole}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Software Engineer, Data Analyst..."
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              What do you need help with? *
            </label>

            <select
              name="topic"
              value={form.topic}
              onChange={handleChange}
              className="input-field"
            >
              {GUIDANCE_TOPICS.map((topic) => (
                <option
                  key={topic}
                  value={topic}
                >
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Describe your request *
              <span className="text-gray-400 font-normal">
                {" "}
                ({form.description.length}/1000,
                min 20)
              </span>
            </label>

            <textarea
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input-field resize-none"
              placeholder="Be specific: What company are you preparing for? What rounds? What topics? What have you already tried?..."
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Session Type
            </label>

            <div className="flex gap-3">
              {[
                "One-on-One",
                "Group Session",
                "Either",
              ].map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                    form.preferredSessionType ===
                    type
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-indigo-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredSessionType"
                    value={type}
                    checked={
                      form.preferredSessionType ===
                      type
                    }
                    onChange={handleChange}
                    className="accent-indigo-600"
                  />

                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit Guidance Request 🚀"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestGuidance;
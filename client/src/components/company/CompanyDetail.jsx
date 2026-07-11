import RoundBadge from "./RoundBadge";
import SkillTag from "./SkillTag";
import { formatDate } from "../../utils/formatDate";
import { Star, Globe, Calendar, CheckCircle2, CircleDot, Building2, MapPin, GraduationCap, Code } from "lucide-react";

const CompanyDetail = ({ company }) => {
  const rating = Math.round(company.difficultyRating || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-600" /> Company Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Domain",    value: company.domain || "—",                       icon: Globe },
            { label: "Avg CTC",   value: company.averageCTC ? `${company.averageCTC} LPA` : "—", icon: CircleDot },
            { label: "Min CGPA",  value: company.minCGPA > 0 ? `${company.minCGPA}+` : "—",      icon: GraduationCap },
            { label: "HQ",        value: company.headquarters || "—",                 icon: MapPin },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <item.icon className="w-4 h-4 text-gray-400 mb-2" />
              <p className="font-bold text-gray-900 text-sm">{item.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {company.description && (
          <p className="text-sm text-gray-600 mt-6 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
            {company.description}
          </p>
        )}

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm mt-5 hover:text-brand-700 transition-colors bg-brand-50 px-4 py-2 rounded-lg"
          >
            <Globe className="w-4 h-4" /> Visit Website
          </a>
        )}
      </div>

      {/* Drive Info */}
      {company.driveStatus !== "none" && (
        <div className={`rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          company.driveStatus === "upcoming" ? "border-brand-200 bg-brand-50" : "border-emerald-200 bg-emerald-50"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${company.driveStatus === "upcoming" ? "bg-white text-brand-600 shadow-sm" : "bg-white text-emerald-600 shadow-sm"}`}>
              {company.driveStatus === "upcoming" ? <Calendar className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {company.driveStatus === "upcoming" ? "Upcoming Placement Drive" : "Active Placement Drive"}
              </h3>
              <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                company.driveStatus === "upcoming" ? "bg-brand-100 text-brand-700 border-brand-200" :
                "bg-emerald-100 text-emerald-700 border-emerald-200"
              }`}>
                {company.driveStatus}
              </span>
            </div>
          </div>
          {company.upcomingDriveDate && (
            <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Scheduled Date</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(company.upcomingDriveDate)}</p>
            </div>
          )}
        </div>
      )}

      {/* Eligibility */}
      {(company.eligibleBranches?.length > 0 || company.skillsRequired?.length > 0) && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5 text-lg flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-600" /> Eligibility & Skills
          </h2>

          {company.eligibleBranches?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Eligible Branches</p>
              <div className="flex flex-wrap gap-2">
                {company.eligibleBranches.map((b) => (
                  <span key={b} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold shadow-sm">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {company.skillsRequired?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {company.skillsRequired.map((s) => (
                  <SkillTag key={s} skill={s} size="lg" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rounds */}
      {company.rounds?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Interview Rounds <span className="text-gray-400 font-medium">({company.rounds.length})</span></h2>
          <div className="space-y-4">
            {company.rounds.map((round, i) => (
              <RoundBadge key={i} round={round} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Grid for Difficulty and Visit History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-1">
          <h2 className="font-bold text-gray-900 mb-4 text-lg">Difficulty Rating</h2>
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-4xl font-extrabold text-gray-900 mb-2">{company.difficultyRating?.toFixed(1) || "0.0"}</span>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
              ))}
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{company.totalRatings} ratings</span>
          </div>
        </div>

        {/* Visit History */}
        {company.visitHistory?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Visit History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {["Year", "Selected", "CTC Offered", "Roles"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {company.visitHistory.sort((a, b) => b.year - a.year).map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{v.year}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{v.studentsSelected} students</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-600">{v.ctcOffered ? `${v.ctcOffered} LPA` : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate" title={v.rolesOffered?.join(", ")}>
                        {v.rolesOffered?.join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
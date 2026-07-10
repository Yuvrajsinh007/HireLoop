import RoundBadge from "./RoundBadge";
import SkillTag from "./SkillTag";
import { formatDate } from "../../utils/formatDate";

const CompanyDetail = ({ company }) => {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-xl ${i < Math.round(company.difficultyRating) ? "text-yellow-400" : "text-gray-200"}`}>
      ★
    </span>
  ));

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-3 text-lg">Company Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Domain",    value: company.domain || "—"             },
            { label: "Avg CTC",   value: company.averageCTC ? `${company.averageCTC} LPA` : "—" },
            { label: "Min CGPA",  value: company.minCGPA > 0 ? `${company.minCGPA}+` : "—"      },
            { label: "HQ",        value: company.headquarters || "—"       },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        {company.description && (
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{company.description}</p>
        )}

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 text-sm mt-3 hover:underline"
          >
            🌐 Visit Website →
          </a>
        )}
      </div>

      {/* Drive Info */}
      {company.driveStatus !== "none" && (
        <div className={`card border-2 ${
          company.driveStatus === "upcoming" ? "border-indigo-200 bg-indigo-50/50" : "border-green-200 bg-green-50/50"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{company.driveStatus === "upcoming" ? "📅" : "🟢"}</span>
            <h3 className="font-bold text-gray-800">
              {company.driveStatus === "upcoming" ? "Upcoming Drive" : "Drive Status"}
            </h3>
            <span className={`badge capitalize ${
              company.driveStatus === "upcoming" ? "badge-indigo" :
              company.driveStatus === "ongoing"  ? "badge-green" : "badge-gray"
            }`}>
              {company.driveStatus}
            </span>
          </div>
          {company.upcomingDriveDate && (
            <p className="text-sm text-gray-700">
              Drive Date: <strong>{formatDate(company.upcomingDriveDate)}</strong>
            </p>
          )}
        </div>
      )}

      {/* Eligibility */}
      {(company.eligibleBranches?.length > 0 || company.skillsRequired?.length > 0) && (
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">Eligibility & Skills</h2>

          {company.eligibleBranches?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Eligible Branches</p>
              <div className="flex flex-wrap gap-2">
                {company.eligibleBranches.map((b) => (
                  <span key={b} className="badge badge-green">{b}</span>
                ))}
              </div>
            </div>
          )}

          {company.skillsRequired?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Required Skills</p>
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
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">Interview Rounds ({company.rounds.length})</h2>
          <div className="space-y-3">
            {company.rounds.map((round, i) => (
              <RoundBadge key={i} round={round} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Difficulty */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-3">Difficulty Rating</h2>
        <div className="flex items-center gap-3">
          <div className="flex">{stars}</div>
          <span className="text-lg font-bold text-gray-800">{company.difficultyRating?.toFixed(1)}</span>
          <span className="text-sm text-gray-400">({company.totalRatings} ratings)</span>
        </div>
      </div>

      {/* Visit History */}
      {company.visitHistory?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">Visit History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Year","Selected","CTC Offered","Roles"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {company.visitHistory.sort((a, b) => b.year - a.year).map((v, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 font-medium">{v.year}</td>
                    <td className="py-2 pr-4 text-green-600 font-semibold">{v.studentsSelected}</td>
                    <td className="py-2 pr-4">{v.ctcOffered ? `${v.ctcOffered} LPA` : "—"}</td>
                    <td className="py-2 pr-4 text-gray-500">{v.rolesOffered?.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;
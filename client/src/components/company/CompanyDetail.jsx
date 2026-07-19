import { Globe, MapPin, Calendar, Users, IndianRupee, GraduationCap } from "lucide-react";
import RoundBadge from "./RoundBadge";
import SkillTag from "./SkillTag";
import { formatDate } from "../../utils/formatDate";

const DRIVE_STATUS_COLORS = {
  UPCOMING:  "bg-indigo-50 text-indigo-700 border-indigo-100",
  ACTIVE:    "bg-emerald-50 text-emerald-700 border-emerald-100",
  COMPLETED: "bg-gray-50 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
};

const CompanyDetail = ({ company, drives = [] }) => {
  const allSkills = [...new Set(drives.flatMap((d) => d.skillsRequired || []))];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* About */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 text-lg mb-4">About {company.name}</h2>
        {company.description ? (
          <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6 whitespace-pre-wrap">
            {company.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-6">No description added yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <Globe className="w-4 h-4 text-gray-400 shrink-0" />
            {company.website ? (
              <a href={company.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-600 truncate hover:underline">
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <span className="text-sm font-medium text-gray-400">No website listed</span>
            )}
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-semibold text-gray-700 truncate">{company.headquarters || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-semibold text-gray-700 truncate">{company.industry || "Other"}</span>
          </div>
        </div>
      </div>

      {/* Skills across all drives */}
      {allSkills.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Skills Typically Required</h2>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => <SkillTag key={s} skill={s} />)}
          </div>
        </div>
      )}

      {/* Drives at your college */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Placement Drives at Your College</h2>

        {drives.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No drives have been recorded for this company at your institution yet.</p>
        ) : (
          <div className="space-y-6">
            {drives.map((drive) => (
              <div key={drive._id} className="border border-gray-100 rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-bold text-gray-900">{drive.title}</h3>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${DRIVE_STATUS_COLORS[drive.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {drive.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {drive.driveDate && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> {formatDate(drive.driveDate)}
                    </div>
                  )}
                  {drive.minCGPA > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> CGPA {drive.minCGPA}+
                    </div>
                  )}
                  {drive.roles?.[0]?.ctcTotal && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <IndianRupee className="w-3.5 h-3.5" /> {drive.roles[0].ctcTotal} LPA
                    </div>
                  )}
                  {drive.totalSelected > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Users className="w-3.5 h-3.5 text-gray-400" /> {drive.totalSelected} selected
                    </div>
                  )}
                </div>

                {drive.roles?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Roles Offered</p>
                    <div className="flex flex-wrap gap-2">
                      {drive.roles.map((r, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                          {r.title} {r.ctcTotal ? `· ${r.ctcTotal} LPA` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {drive.rounds?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Selection Process</p>
                    <div className="space-y-2">
                      {drive.rounds.map((round, i) => (
                        <RoundBadge key={i} round={round} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
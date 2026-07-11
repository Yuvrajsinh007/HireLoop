import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import { Star, Calendar, Building2 } from "lucide-react";
import SkillTag from "./SkillTag";

const DRIVE_COLORS = {
  upcoming: "bg-indigo-50 text-indigo-700 border-indigo-100",
  ongoing:  "bg-green-50 text-green-700 border-green-100",
  completed:"bg-gray-50 text-gray-600 border-gray-200",
  none:     "bg-gray-50 text-gray-400 border-gray-100",
};

const CompanyCard = ({ company }) => {
  const initial = company.name?.[0]?.toUpperCase() || "?";
  const rating = Math.round(company.difficultyRating || 0);

  return (
    <Link to={`/companies/${company._id}`} className="block h-full">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 group h-full flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-brand-700 text-xl shrink-0">
                {company.name ? initial : <Building2 className="w-6 h-6 stroke-[1.5]" />}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-brand-600 transition-colors">
                {company.name}
              </h3>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                {company.domain || "Technology"}
              </p>
            </div>
          </div>

          {company.driveStatus && company.driveStatus !== "none" && (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm shrink-0 ${DRIVE_COLORS[company.driveStatus]}`}>
              {company.driveStatus}
            </span>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-5 leading-relaxed flex-1">
            {company.description}
          </p>
        )}

        {/* Skills */}
        {company.skillsRequired?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {company.skillsRequired.slice(0, 3).map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
            {company.skillsRequired.length > 3 && (
              <span className="px-2.5 py-1 text-xs font-bold bg-gray-50 text-gray-500 rounded-lg border border-gray-100">
                +{company.skillsRequired.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`} 
                />
              ))}
              <span className="text-xs font-bold text-gray-400 ml-1.5">({company.totalRatings || 0})</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {company.averageCTC > 0 && (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">~{company.averageCTC} LPA</span>
              )}
              {company.minCGPA > 0 && (
                <span className="bg-gray-50 px-2 py-1 rounded-md">CGPA {company.minCGPA}+</span>
              )}
            </div>
          </div>

          {company.upcomingDriveDate && company.driveStatus === "upcoming" && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 p-2 rounded-lg justify-center uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              Drive on {formatDate(company.upcomingDriveDate)}
            </div>
          )}
        </div>
        
      </div>
    </Link>
  );
};

export default CompanyCard;
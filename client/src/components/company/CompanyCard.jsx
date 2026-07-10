import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";

const DRIVE_COLORS = {
  upcoming: "badge-indigo",
  ongoing:  "badge-green",
  completed:"badge-gray",
  none:     "badge-gray",
};

const CompanyCard = ({ company }) => {
  const initial = company.name?.[0]?.toUpperCase() || "?";

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(company.difficultyRating) ? "text-yellow-400" : "text-gray-200"}>
      ★
    </span>
  ));

  return (
    <Link to={`/companies/${company._id}`} className="block">
      <div className="card-hover group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-12 h-12 rounded-xl object-cover border border-gray-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg">
                {initial}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {company.name}
              </h3>
              <p className="text-xs text-gray-400">{company.domain || "Technology"}</p>
            </div>
          </div>

          {company.driveStatus && company.driveStatus !== "none" && (
            <span className={`badge text-xs capitalize ${DRIVE_COLORS[company.driveStatus]}`}>
              {company.driveStatus}
            </span>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{company.description}</p>
        )}

        {/* Skills */}
        {company.skillsRequired?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {company.skillsRequired.slice(0, 4).map((skill) => (
              <span key={skill} className="badge badge-indigo text-xs">{skill}</span>
            ))}
            {company.skillsRequired.length > 4 && (
              <span className="badge badge-gray text-xs">+{company.skillsRequired.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm">
            {stars}
            <span className="text-xs text-gray-400 ml-1">({company.totalRatings})</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {company.averageCTC > 0 && (
              <span className="font-medium text-green-600">~{company.averageCTC} LPA</span>
            )}
            {company.minCGPA > 0 && (
              <span>CGPA {company.minCGPA}+</span>
            )}
          </div>
        </div>

        {company.upcomingDriveDate && company.driveStatus === "upcoming" && (
          <p className="text-xs text-indigo-600 mt-2 font-medium">
            📅 Drive on {formatDate(company.upcomingDriveDate)}
          </p>
        )}
      </div>
    </Link>
  );
};

export default CompanyCard;
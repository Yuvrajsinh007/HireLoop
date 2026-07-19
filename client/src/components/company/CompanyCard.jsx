import { Link } from "react-router-dom";
import { Building2, Globe, MapPin } from "lucide-react";

const CompanyCard = ({ company }) => {
  const initial = company.name?.[0]?.toUpperCase() || "?";

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
                {company.industry || "Other"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-5 leading-relaxed flex-1">
            {company.description}
          </p>
        )}

        {/* Footer meta */}
        <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
          {company.headquarters && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {company.headquarters}
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 truncate">
              <Globe className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
        </div>

      </div>
    </Link>
  );
};

export default CompanyCard;
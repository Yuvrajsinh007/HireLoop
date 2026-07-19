import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelpers";
import { ShieldAlert, Home } from "lucide-react";

const Unauthorized = () => {
  const { user, isAuthenticated } = useAuth();
  const homePath = isAuthenticated ? getDashboardPath(user) : "/";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h1>
      <p className="text-sm font-medium text-gray-500 mb-8 max-w-sm">
        You don't have permission to view this page. If you think this is a mistake, contact your placement office.
      </p>
      <Link
        to={homePath}
        className="flex items-center gap-2 bg-brand-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
      >
        <Home className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelpers";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const { user, isAuthenticated } = useAuth();
  const homePath = isAuthenticated ? getDashboardPath(user) : "/";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-extrabold text-gray-200 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm font-medium text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to={homePath}
          className="flex items-center gap-2 bg-brand-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
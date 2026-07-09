import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">HireLoop</span>
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Your Campus Placement
          <span className="text-indigo-600"> Intelligence</span> Platform
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Track your placement journey, read senior interview experiences,
          and get placed at your dream company — all in one place.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {isAuthenticated ? (
            <Link
              to={
                user?.role === "admin" ? "/admin/dashboard" :
                user?.role === "officer" ? "/officer/dashboard" :
                "/dashboard"
              }
              className="btn-primary text-base px-8 py-3"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-base px-8 py-3">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left">
          {[
            { icon: "📋", title: "Journey Tracker", desc: "Track every application stage from applied to offer." },
            { icon: "🏢", title: "Company Intel", desc: "Round details, difficulty ratings and past experiences." },
            { icon: "🤝", title: "Mentor Connect", desc: "Book mock interviews with seniors who've been placed." },
          ].map((f) => (
            <div key={f.title} className="card hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
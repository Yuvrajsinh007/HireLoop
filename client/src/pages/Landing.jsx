import { Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { Map, Building2, Handshake } from "lucide-react";

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
          Your Campus Placement <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">
            Intelligence
          </span> Platform
        </h1>

        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Track your placement journey, read senior interview experiences,
          and get placed at your dream company — all in one centralized hub.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {isAuthenticated ? (
            <Link
              to={
                user?.role === "admin" ? "/admin/dashboard" :
                user?.role === "officer" ? "/officer/dashboard" :
                "/dashboard"
              }
              className="bg-brand-600 text-white font-medium text-base px-8 py-3.5 rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="bg-brand-600 text-white font-medium text-base px-8 py-3.5 rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg">
                Get Started Free
              </Link>
              <Link to="/login" className="bg-white text-gray-700 border border-gray-200 font-medium text-base px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
          {[
            { icon: Map, title: "Journey Tracker", desc: "Track every application stage from applied to your final offer." },
            { icon: Building2, title: "Company Intel", desc: "Access round details, difficulty ratings, and specific requirements." },
            { icon: Handshake, title: "Mentor Connect", desc: "Book mock interviews with seniors who have already been placed." },
          ].map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
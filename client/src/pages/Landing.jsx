// client/src/pages/Landing.jsx

import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/roleHelpers";

const FEATURES = [
  {
    icon: "📋",
    title: "Journey Tracker",
    desc: "Track every application stage from applied to offer on a visual Kanban board.",
  },
  {
    icon: "🚀",
    title: "Placement Drives",
    desc: "Browse eligible drives, apply, and track your application status.",
  },
  {
    icon: "📝",
    title: "Interview Experiences",
    desc: "Read real experiences from seniors. Share yours to help juniors.",
  },
  {
    icon: "🤝",
    title: "Guided Mentorship",
    desc: "Request guidance from alumni — mediated by your placement office.",
  },
  {
    icon: "📊",
    title: "Placement Analytics",
    desc: "Officers get real-time dashboards on placement trends and student progress.",
  },
  {
    icon: "🏫",
    title: "Multi-Institution",
    desc: "Each college is fully isolated. Your data stays within your campus.",
  },
];

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              HireLoop
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath(user)}
                className="btn-primary text-sm"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto fade-in">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🏫 Built for Campus Placements
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your Campus Placement
            <span className="text-indigo-600"> Intelligence</span> Platform
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track applications, explore company intel, read senior experiences,
            and connect with alumni — all within your verified campus community.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath(user)}
                className="btn-primary text-base px-8 py-3"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary text-base px-8 py-3"
                >
                  Get Started Free
                </Link>

                <Link
                  to="/login"
                  className="btn-secondary text-base px-8 py-3"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything your placement needs
            </h2>

            <p className="text-gray-500 max-w-xl mx-auto">
              One platform for students, alumni, and placement officers — with
              strict college-level data isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{f.icon}</div>

                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for everyone on campus
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                role: "Students",
                icon: "🎓",
                color: "bg-indigo-50 border-indigo-200",
                desc: "Track drives, applications, and request alumni guidance through your placement office.",
              },
              {
                role: "Alumni",
                icon: "🏅",
                color: "bg-green-50 border-green-200",
                desc: "Share experiences, manage your career timeline, and mentor juniors via officer-mediated sessions.",
              },
              {
                role: "Placement Officers",
                icon: "📈",
                color: "bg-yellow-50 border-yellow-200",
                desc: "Manage drives, assign alumni mentors, send alerts, and view real-time placement analytics.",
              },
            ].map((r) => (
              <div
                key={r.role}
                className={`rounded-2xl border-2 p-6 ${r.color}`}
              >
                <div className="text-4xl mb-4">{r.icon}</div>

                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {r.role}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your placement journey?
          </h2>

          <p className="text-indigo-200 mb-8">
            Join your campus community on HireLoop today.
          </p>

          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Get Started Free →
            </Link>
          )}
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">H</span>
          </div>

          <span className="text-white font-semibold">HireLoop</span>
        </div>

        <p>
          © {new Date().getFullYear()} HireLoop · Campus Placement Intelligence
          Platform
        </p>
      </footer>
    </div>
  );
};

export default Landing;
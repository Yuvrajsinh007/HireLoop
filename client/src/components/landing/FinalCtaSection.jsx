import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/roleHelpers";

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
  >
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FinalCtaSection = () => {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = isAuthenticated ? getDashboardPath(user) : "/register";

  return (
    <section className="px-5 pb-20 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-16 text-center shadow-2xl shadow-indigo-300/50 sm:px-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg ring-1 ring-white/20">
            ✦
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-[-0.03em] text-white sm:text-5xl">
            Your next opportunity deserves a clearer path.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-indigo-100 sm:text-lg">
            Build your placement journey with the people, knowledge, and momentum
            already within your campus community.
          </p>

          <div className="mt-9">
            <Link
              to={dashboardPath}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-bold text-indigo-700 shadow-xl shadow-indigo-950/20 transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              {isAuthenticated ? "Go to dashboard" : "Get started with HireLoop"}
              <ArrowIcon />
            </Link>
          </div>

          {!isAuthenticated && (
            <p className="mt-4 text-sm text-indigo-100">
              Already part of HireLoop?{" "}
              <Link
                to="/login"
                className="font-bold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
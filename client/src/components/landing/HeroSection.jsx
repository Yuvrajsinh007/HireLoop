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

const HeroDashboardPreview = () => {
  const pipelineColumns = [
    {
      title: "Applied",
      count: "04",
      dot: "bg-sky-500",
      company: "Amazon",
    },
    {
      title: "Assessment",
      count: "02",
      dot: "bg-amber-500",
      company: "Deloitte",
    },
    {
      title: "Interview",
      count: "02",
      dot: "bg-emerald-500",
      company: "Microsoft",
    },
  ];

  return (
    <div className="relative mx-auto mt-16 max-w-6xl sm:mt-20">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-r from-indigo-200/50 via-violet-200/30 to-sky-200/50 blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl shadow-indigo-950/10 sm:rounded-3xl sm:p-3">
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="rounded-md bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-400 sm:text-xs">
              hireloop.app/dashboard
            </div>

            <div className="w-10" />
          </div>

          <div className="grid min-h-[370px] grid-cols-1 sm:grid-cols-[190px_1fr]">
            <aside className="hidden border-r border-slate-200 bg-white p-4 sm:block">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">
                  H
                </div>

                <span className="text-sm font-bold text-slate-900">
                  HireLoop
                </span>
              </div>

              <div className="mt-5 space-y-2">
                {[
                  ["Overview", true],
                  ["My applications", false],
                  ["Placement drives", false],
                  ["Experiences", false],
                ].map(([item, active]) => (
                  <div
                    key={item}
                    className={`rounded-lg px-3 py-2 text-xs font-medium ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-500"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </aside>

            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                    Good morning, Ananya
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    Your placement journey
                  </h2>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                    This week
                  </p>

                  <p className="text-sm font-black text-indigo-700">
                    3 new updates
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
                {[
                  ["Applications", "08", "text-indigo-600"],
                  ["In progress", "03", "text-amber-500"],
                  ["Interviews", "02", "text-emerald-500"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4"
                  >
                    <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                      {label}
                    </p>

                    <p className={`mt-1 text-xl font-black sm:text-2xl ${color}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Application pipeline
                  </h3>

                  <span className="text-xs font-semibold text-indigo-600">
                    View all
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {pipelineColumns.map((column) => (
                    <div
                      key={column.title}
                      className="rounded-xl bg-slate-100/80 p-2.5 sm:p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${column.dot}`}
                          />

                          <span className="truncate text-[10px] font-bold text-slate-600 sm:text-xs">
                            {column.title}
                          </span>
                        </div>

                        <span className="text-[10px] font-bold text-slate-400">
                          {column.count}
                        </span>
                      </div>

                      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[8px] font-black text-white">
                          {column.company.charAt(0)}
                        </div>

                        <p className="mt-2 truncate text-[10px] font-bold text-slate-800">
                          {column.company}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-slate-400">
                          Software Engineer
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-2 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-900/10 md:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg">
            ✓
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500">
              Application updated
            </p>

            <p className="text-sm font-bold text-slate-900">
              Interview scheduled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = isAuthenticated ? getDashboardPath(user) : "/register";

  return (
    <section className="relative px-5 pb-20 pt-10 sm:px-6 sm:pt-14 lg:pb-28 lg:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Built for modern campus placements
          </div>

          <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
            Turn placement chaos into
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              career momentum.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            HireLoop brings applications, placement drives
            and interview knowledge into one verified campus community.
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              to={dashboardPath}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              {isAuthenticated ? "Open your dashboard" : "Start your journey"}
              <ArrowIcon />
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Sign in to HireLoop
              </Link>
            )}
          </div>

          {!isAuthenticated && (
            <p className="mt-4 text-sm text-slate-500">
              Join through your verified college community.
            </p>
          )}
        </div>

        <HeroDashboardPreview />
      </div>
    </section>
  );
};

export default HeroSection;
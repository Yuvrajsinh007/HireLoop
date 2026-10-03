const CheckIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="m5 12 4.25 4.25L19 6.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  
  const AnalyticsSection = () => {
    const benefits = [
      "A trusted, college-verified community",
      "Clear ownership at every placement stage",
      "Institution-level workspace and data separation",
    ];
  
    const stats = [
      ["Active drives", "12"],
      ["Applications", "428"],
      ["Mentor matches", "36"],
    ];
  
    return (
      <section className="bg-slate-950 px-5 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-300">
              More than a tracker
            </p>
  
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
              A shared system for better placement outcomes.
            </h2>
  
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              HireLoop keeps students prepared, alumni connected, and placement
              teams informed—without blending data across institutions.
            </p>
  
            <div className="mt-8 space-y-4">
              {benefits.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                    <CheckIcon />
                  </span>
  
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
  
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur sm:p-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">
                    Placement activity
                  </p>
  
                  <p className="mt-1 text-xs text-slate-400">
                    A quick view for your placement office
                  </p>
                </div>
  
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  Live
                </span>
              </div>
  
              <div className="mt-8 grid grid-cols-3 gap-3">
                {stats.map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white/[0.06] p-3 sm:p-4">
                    <p className="text-lg font-black text-white sm:text-2xl">
                      {value}
                    </p>
  
                    <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-xs">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
  
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">
                    Application readiness
                  </p>
  
                  <p className="text-sm font-black text-indigo-300">78%</p>
                </div>
  
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" />
                </div>
  
                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Students with active profiles, tracked applications, or upcoming
                  placement actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
export default AnalyticsSection;
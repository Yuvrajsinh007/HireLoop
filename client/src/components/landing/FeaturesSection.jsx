const FEATURES = [
    {
      icon: "◎",
      eyebrow: "Stay organized",
      title: "Application command center",
      desc: "Move every opportunity from discovery to offer with a clear, visual pipeline built for placement season.",
      accent: "from-violet-500 to-indigo-600",
    },
    {
      icon: "↗",
      eyebrow: "Act faster",
      title: "Drive discovery",
      desc: "See eligible campus drives, deadlines, requirements, and application status without hunting through notices.",
      accent: "from-sky-500 to-cyan-500",
    },
    {
      icon: "✦",
      eyebrow: "Prepare smarter",
      title: "Real interview intelligence",
      desc: "Learn from verified senior experiences, role-specific rounds, and practical preparation insights.",
      accent: "from-amber-400 to-orange-500",
    },
    {
      icon: "◔",
      eyebrow: "See the signal",
      title: "Placement analytics",
      desc: "Give placement teams a live view of engagement, outcomes, trends, and student progress.",
      accent: "from-pink-500 to-rose-500",
    },
    {
      icon: "⌘",
      eyebrow: "Keep data private",
      title: "Campus-first by design",
      desc: "Every institution operates in an isolated workspace, keeping its placement data within its community.",
      accent: "from-fuchsia-500 to-purple-600",
    },
  ];
  
  const FeaturesSection = () => {
    return (
      <section className="px-5 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
              One platform, every step
            </p>
  
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
              Everything you need to make placement progress visible.
            </h2>
  
            <p className="mt-4 text-base leading-7 text-slate-600">
              Replace scattered spreadsheets, messages, and notice boards with a
              focused workflow built around how campus hiring actually works.
            </p>
          </div>
  
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-xl font-bold text-white shadow-lg`}
                >
                  {feature.icon}
                </div>
  
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.13em] text-indigo-600">
                  {feature.eyebrow}
                </p>
  
                <h3 className="mt-2 text-lg font-extrabold tracking-tight text-slate-950">
                  {feature.title}
                </h3>
  
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.desc}
                </p>
  
                <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-indigo-100/70 blur-2xl transition group-hover:bg-indigo-200/80" />
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
export default FeaturesSection;
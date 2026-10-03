const ROLES = [
    {
      role: "Students",
      icon: "🎓",
      color: "bg-violet-50 border-violet-100",
      badge: "text-violet-700 bg-violet-100",
      description:
        "Build confidence through a single, calm view of every opportunity and next step.",
      benefits: [
        "Track applications in one place",
        "Discover eligible placement drives",
        "Learn from senior interview stories",
      ],
    },
    {
      role: "Alumni",
      icon: "🏅",
      color: "bg-emerald-50 border-emerald-100",
      badge: "text-emerald-700 bg-emerald-100",
      description:
        "Give back with meaningful context, experiences, and mentorship opportunities.",
      benefits: [
        "Share your hiring journey",
        "Support juniors at the right time",
        "Manage your professional timeline",
      ],
    },
    {
      role: "Placement offices",
      icon: "📈",
      color: "bg-amber-50 border-amber-100",
      badge: "text-amber-700 bg-amber-100",
      description:
        "Run a more informed placement process without losing the human connection.",
      benefits: [
        "Publish and manage drives",
        "Coordinate alumni guidance",
        "Monitor placement progress",
      ],
    },
  ];
  
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
  
  const RolesSection = () => {
    return (
      <section className="px-5 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
              Designed for the whole ecosystem
            </p>
  
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
              A better experience for every role.
            </h2>
  
            <p className="mt-4 text-base leading-7 text-slate-600">
              Everyone gets the context they need, without losing the shared
              picture of campus placement progress.
            </p>
          </div>
  
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {ROLES.map((role) => (
              <article
                key={role.role}
                className={`rounded-2xl border p-6 sm:p-7 ${role.color}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-4xl">{role.icon}</div>
  
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${role.badge}`}
                  >
                    HireLoop for
                  </span>
                </div>
  
                <h3 className="mt-6 text-xl font-black tracking-tight text-slate-950">
                  {role.role}
                </h3>
  
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {role.description}
                </p>
  
                <div className="mt-6 border-t border-slate-900/10 pt-5">
                  {role.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="mb-3 flex items-start gap-2.5 text-sm font-medium text-slate-700 last:mb-0"
                    >
                      <span className="mt-0.5 text-indigo-600">
                        <CheckIcon />
                      </span>
  
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
export default RolesSection;
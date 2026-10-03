const CampusBanner = () => {
    return (
      <section className="border-y border-slate-100 bg-white px-5 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm font-medium text-slate-500">
            One connected placement experience for the entire campus.
          </p>
  
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400 sm:justify-end">
            <span>Students</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span>Alumni</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span>Placement teams</span>
          </div>
        </div>
      </section>
    );
  };
  
export default CampusBanner;
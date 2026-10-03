const LandingBackground = () => {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[680px] overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-[-260px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -left-20 top-36 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      </div>
    );
  };
  
export default LandingBackground;
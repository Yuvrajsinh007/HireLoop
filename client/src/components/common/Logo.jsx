import { Link } from "react-router-dom";

const Logo = ({ compact = false, className = "" }) => {
  return (
    <Link
      to="/"
      aria-label="HireLoop home"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 shadow-lg shadow-indigo-200">
        <span className="relative text-sm font-black text-white">H</span>
        <span className="absolute -bottom-3 -right-3 h-7 w-7 rounded-full bg-white/20" />
      </div>

      {!compact && (
        <span className="text-lg font-extrabold tracking-tight text-slate-950">
          Hire<span className="text-indigo-600">Loop</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
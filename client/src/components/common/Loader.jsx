import { LoaderCircle } from "lucide-react";

const Loader = ({
  fullScreen = false,
  label = "Loading workspace",
  compact = false,
}) => {
  const wrapperClass = fullScreen
    ? "fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-50/90 px-4 backdrop-blur-sm"
    : compact
      ? "flex min-h-[160px] w-full items-center justify-center"
      : "flex min-h-[70vh] w-full items-center justify-center px-4";

  return (
    <div className={wrapperClass} role="status" aria-live="polite">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 rounded-2xl bg-violet-100 animate-ping opacity-50" />

          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/15">
            <LoaderCircle className="h-5 w-5 animate-spin text-emerald-400" />
          </div>
        </div>

        <p className="mt-4 text-sm font-bold text-slate-700">{label}</p>

        {!compact && (
          <p className="mt-1 text-xs font-medium text-slate-400">
            Please wait a moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;
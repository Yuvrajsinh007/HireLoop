const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const Avatar = ({
  src,
  name = "User",
  size = "md",
  className = "",
  status,
}) => {
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0F172A&color=F8FAFC&bold=true&format=svg`;

  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={src || fallbackUrl}
        alt={`${name}'s avatar`}
        onError={(event) => {
          event.currentTarget.src = fallbackUrl;
        }}
        className={`${sizeClass} block rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200`}
      />

      {status && (
        <span
          aria-label={`${status} status`}
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${
            size === "xs" || size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"
          } ${
            status === "online"
              ? "bg-emerald-500"
              : status === "away"
                ? "bg-amber-400"
                : "bg-slate-400"
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
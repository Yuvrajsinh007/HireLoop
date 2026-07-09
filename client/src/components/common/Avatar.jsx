const sizeMap = {
    xs:  "w-6 h-6 text-xs",
    sm:  "w-8 h-8 text-sm",
    md:  "w-10 h-10 text-sm",
    lg:  "w-14 h-14 text-base",
    xl:  "w-20 h-20 text-xl",
  };
  
  const Avatar = ({ src, name = "U", size = "md", className = "" }) => {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&bold=true`;
    const sizeClass = sizeMap[size] || sizeMap.md;
  
    return (
      <img
        src={src || fallbackUrl}
        alt={name}
        onError={(e) => { e.target.src = fallbackUrl; }}
        className={`${sizeClass} rounded-full object-cover border-2 border-indigo-100 flex-shrink-0 ${className}`}
      />
    );
  };
  
  export default Avatar;
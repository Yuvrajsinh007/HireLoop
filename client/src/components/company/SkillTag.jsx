const SkillTag = ({ skill, size = "sm" }) => {
    const sizeClass = size === "lg"
      ? "px-3 py-1 text-sm"
      : "px-2.5 py-0.5 text-xs";
  
    return (
      <span className={`inline-flex items-center ${sizeClass} rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-100`}>
        {skill}
      </span>
    );
  };
  
  export default SkillTag;
const SkillTag = ({ skill, size = "sm" }) => {
  const sizeClass = size === "lg"
    ? "px-3.5 py-1.5 text-sm"
    : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center ${sizeClass} rounded-lg font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-100 shadow-sm`}>
      {skill}
    </span>
  );
};

export default SkillTag;
import { ROLES, ACADEMIC_STATUS } from "./constants";

// ─── Role Checks ───────────────────────────────────────────────────────────
export const isSuperAdmin   = (user) => user?.role === ROLES.SUPER_ADMIN;
export const isCollegeAdmin = (user) => user?.role === ROLES.COLLEGE_ADMIN;
export const isOfficer      = (user) => user?.role === ROLES.OFFICER;
export const isMember       = (user) => user?.role === ROLES.MEMBER;

export const isStaff = (user) =>
  [ROLES.COLLEGE_ADMIN, ROLES.OFFICER, ROLES.SUPER_ADMIN].includes(user?.role);

// ─── Academic Status Checks ────────────────────────────────────────────────
export const isEnrolled  = (user) => user?.academicStatus === ACADEMIC_STATUS.ENROLLED;
export const isFinalYear = (user) => user?.academicStatus === ACADEMIC_STATUS.FINAL_YEAR;
export const isAlumni    = (user) => user?.academicStatus === ACADEMIC_STATUS.GRADUATED;

export const isCurrentStudent = (user) =>
  [ACADEMIC_STATUS.ENROLLED, ACADEMIC_STATUS.FINAL_YEAR].includes(user?.academicStatus);

// ─── Permission Checks ─────────────────────────────────────────────────────
export const canManageDrives     = (user) => isStaff(user);
export const canManageMembers    = (user) => isStaff(user);
export const canViewReports      = (user) => isStaff(user);
export const canManageInstitution= (user) => isCollegeAdmin(user) || isSuperAdmin(user);
export const canManageGuidance   = (user) => isStaff(user);

// Students cannot contact alumni directly — officer must mediate
export const canContactAlumni    = (user) => isStaff(user);

// Only current students can submit guidance requests
export const canRequestGuidance  = (user) => isMember(user) && isCurrentStudent(user);

// Only alumni (graduated members) can appear in mentorship suggestions
export const canOfferMentorship  = (user) => isMember(user) && isAlumni(user);

// ─── Dashboard Path ────────────────────────────────────────────────────────
export const getDashboardPath = (user) => {
  if (!user) return "/login";
  if (isSuperAdmin(user))   return "/super-admin/dashboard";
  if (isCollegeAdmin(user)) return "/college-admin/dashboard";
  if (isOfficer(user))      return "/officer/dashboard";
  if (isAlumni(user))       return "/alumni/dashboard";
  return "/dashboard"; // student
};

// ─── Role Labels ───────────────────────────────────────────────────────────
export const getRoleLabel = (user) => {
  if (!user) return "Unknown";
  if (isSuperAdmin(user))   return "Platform Admin";
  if (isCollegeAdmin(user)) return "College Admin";
  if (isOfficer(user))      return "Placement Officer";
  if (isAlumni(user))       return "Alumni";
  if (isFinalYear(user))    return "Final Year Student";
  if (isEnrolled(user))     return "Student";
  return "Member";
};

export const getRoleBadgeColor = (user) => {
  if (!user) return "badge-gray";
  if (isSuperAdmin(user))   return "badge-red";
  if (isCollegeAdmin(user)) return "badge-purple";
  if (isOfficer(user))      return "badge-yellow";
  if (isAlumni(user))       return "badge-green";
  return "badge-indigo";
};

// ─── Navigation Items per Role ─────────────────────────────────────────────
export const getNavItems = (user) => {
  if (!user) return [];

  const common = [
    { path: "/companies",    label: "Companies",   icon: "🏢" },
    { path: "/experiences",  label: "Experiences", icon: "📝" },
    { path: "/profile",      label: "My Profile",  icon: "👤" },
  ];

  if (isSuperAdmin(user)) {
    return [
      { path: "/super-admin/dashboard",    label: "Dashboard",    icon: "📊" },
      { path: "/super-admin/institutions", label: "Institutions", icon: "🏫" },
      { path: "/super-admin/users",        label: "All Users",    icon: "👥" },
    ];
  }

  if (isCollegeAdmin(user)) {
    return [
      { path: "/college-admin/dashboard",         label: "Dashboard",         icon: "📊" },
      { path: "/college-admin/academic-structure", label: "Academic Structure",icon: "🏫" },
      { path: "/college-admin/staff",             label: "Manage Staff",      icon: "👥" },
      { path: "/officer/dashboard",               label: "Placement Overview",icon: "📈" },
      { path: "/officer/members",                 label: "Members",           icon: "🎓" },
      { path: "/officer/drives",                  label: "Drives",            icon: "🚀" },
      { path: "/officer/guidance",                label: "Guidance",          icon: "🤝" },
      { path: "/officer/reports",                 label: "Reports",           icon: "📑" },
      ...common,
    ];
  }

  if (isOfficer(user)) {
    return [
      { path: "/officer/dashboard", label: "Dashboard",  icon: "📊" },
      { path: "/officer/members",   label: "Members",    icon: "🎓" },
      { path: "/officer/drives",    label: "Drives",     icon: "🚀" },
      { path: "/officer/guidance",  label: "Guidance",   icon: "🤝" },
      { path: "/officer/reports",   label: "Reports",    icon: "📑" },
      ...common,
    ];
  }

  if (isAlumni(user)) {
    return [
      { path: "/alumni/dashboard",  label: "Dashboard",        icon: "📊" },
      { path: "/alumni/career",     label: "My Career",        icon: "💼" },
      { path: "/alumni/sessions",   label: "Mentorship",       icon: "🤝" },
      ...common,
      { path: "/saved-experiences", label: "Saved",            icon: "🔖" },
    ];
  }

  // Current student
  return [
    { path: "/dashboard",         label: "Dashboard",        icon: "📊" },
    { path: "/journey",           label: "My Journey",       icon: "📋" },
    { path: "/drives",            label: "Drives",           icon: "🚀" },
    { path: "/guidance/request",  label: "Request Guidance", icon: "🤝" },
    { path: "/guidance/my",       label: "My Requests",      icon: "📬" },
    ...common,
    { path: "/saved-experiences", label: "Saved",            icon: "🔖" },
  ];
};
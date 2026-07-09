import { ROLES } from "./constants";

export const isStudent  = (user) => user?.role === ROLES.STUDENT;
export const isSenior   = (user) => user?.role === ROLES.SENIOR;
export const isOfficer  = (user) => user?.role === ROLES.OFFICER;
export const isAdmin    = (user) => user?.role === ROLES.ADMIN;

export const canAccessOfficer = (user) =>
  [ROLES.OFFICER, ROLES.ADMIN].includes(user?.role);

export const canAccessAdmin = (user) => user?.role === ROLES.ADMIN;

export const canWriteExperience = (user) =>
  [ROLES.STUDENT, ROLES.SENIOR, ROLES.ADMIN].includes(user?.role);

export const canOfferMentorship = (user) =>
  [ROLES.SENIOR, ROLES.ADMIN].includes(user?.role);

export const getRoleBadgeColor = (role) => {
  const map = {
    student: "badge-indigo",
    senior:  "badge-green",
    officer: "badge-yellow",
    admin:   "badge-red",
  };
  return map[role] || "badge-gray";
};

export const getRoleLabel = (role) => {
  const map = {
    student: "Student",
    senior:  "Senior / Alumni",
    officer: "Placement Officer",
    admin:   "Admin",
  };
  return map[role] || role;
};

/**
 * Get home dashboard path based on role
 */
export const getDashboardPath = (role) => {
  if (role === ROLES.ADMIN)   return "/admin/dashboard";
  if (role === ROLES.OFFICER) return "/officer/dashboard";
  return "/dashboard";
};
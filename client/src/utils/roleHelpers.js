import {
  Archive,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  LineChart,
  MessageSquareMore,
  Network,
  ShieldCheck,
  UserCog,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { ROLES, ACADEMIC_STATUS } from "./constants";

// ─── Role Checks ───────────────────────────────────────────────────────────

export const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;

export const isCollegeAdmin = (user) => user?.role === ROLES.COLLEGE_ADMIN;

export const isOfficer = (user) => user?.role === ROLES.OFFICER;

export const isMember = (user) => user?.role === ROLES.MEMBER;

export const isStaff = (user) =>
  [ROLES.COLLEGE_ADMIN, ROLES.OFFICER, ROLES.SUPER_ADMIN].includes(
    user?.role
  );

// ─── Academic Status Checks ────────────────────────────────────────────────

export const isEnrolled = (user) =>
  user?.academicStatus === ACADEMIC_STATUS.ENROLLED;

export const isFinalYear = (user) =>
  user?.academicStatus === ACADEMIC_STATUS.FINAL_YEAR;

export const isAlumni = (user) =>
  user?.academicStatus === ACADEMIC_STATUS.GRADUATED;

export const isCurrentStudent = (user) =>
  [ACADEMIC_STATUS.ENROLLED, ACADEMIC_STATUS.FINAL_YEAR].includes(
    user?.academicStatus
  );

// ─── Permission Checks ─────────────────────────────────────────────────────

export const canManageDrives = (user) => isStaff(user);

export const canManageMembers = (user) => isStaff(user);

export const canViewReports = (user) => isStaff(user);

export const canManageInstitution = (user) =>
  isCollegeAdmin(user) || isSuperAdmin(user);

export const canManageGuidance = (user) => isStaff(user);

// Students cannot contact alumni directly. Staff manages guidance mediation.
export const canContactAlumni = (user) => isStaff(user);

// Only active current students can submit a guidance request.
export const canRequestGuidance = (user) =>
  isMember(user) && isCurrentStudent(user);

// Only graduated members can become alumni mentors.
export const canOfferMentorship = (user) =>
  isMember(user) && isAlumni(user);

// ─── Dashboard Path ────────────────────────────────────────────────────────

export const getDashboardPath = (user) => {
  if (!user) return "/login";

  if (isSuperAdmin(user)) return "/super-admin/dashboard";

  if (isCollegeAdmin(user)) return "/college-admin/dashboard";

  if (isOfficer(user)) return "/officer/dashboard";

  if (isAlumni(user)) return "/alumni/dashboard";

  return "/dashboard";
};

// ─── Role Labels ───────────────────────────────────────────────────────────

export const getRoleLabel = (user) => {
  if (!user) return "Guest";

  if (isSuperAdmin(user)) return "Platform Administrator";

  if (isCollegeAdmin(user)) return "College Administrator";

  if (isOfficer(user)) return "Placement Officer";

  if (isAlumni(user)) return "Alumni";

  if (isFinalYear(user)) return "Final-Year Student";

  if (isEnrolled(user)) return "Student";

  return "Community Member";
};

export const getRoleBadgeColor = (user) => {
  if (!user) return "badge-gray";

  if (isSuperAdmin(user)) return "badge-rose";

  if (isCollegeAdmin(user)) return "badge-violet";

  if (isOfficer(user)) return "badge-amber";

  if (isAlumni(user)) return "badge-emerald";

  return "badge-slate";
};

// ─── Sidebar Navigation ────────────────────────────────────────────────────
// `icon` must be a Lucide React component. Do not use emoji strings here.

const exploreItems = [
  {
    path: "/companies",
    label: "Companies",
    icon: Building2,
    group: "Explore",
  },
  {
    path: "/drives",
    label: "Placement Drives",
    icon: BriefcaseBusiness,
    group: "Explore",
  },
  {
    path: "/experiences",
    label: "Interview Experiences",
    icon: BookOpenCheck,
    group: "Explore",
  },
];

const profileItem = {
  path: "/profile",
  label: "My Profile",
  icon: UserRound,
  group: "Account",
};

const savedExperiencesItem = {
  path: "/saved-experiences",
  label: "Saved Experiences",
  icon: Archive,
  group: "Account",
};

export const getNavItems = (user) => {
  if (!user) return [];

  // ── Super Admin ──────────────────────────────────────────────────────────
  if (isSuperAdmin(user)) {
    return [
      {
        path: "/super-admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        group: "Workspace",
      },
      {
        path: "/super-admin/institutions",
        label: "Institutions",
        icon: Network,
        group: "Administration",
      },
      {
        path: "/super-admin/users",
        label: "All Users",
        icon: UsersRound,
        group: "Administration",
      },
      profileItem,
    ];
  }

  // ── College Admin ────────────────────────────────────────────────────────
  if (isCollegeAdmin(user)) {
    return [
      {
        path: "/college-admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        group: "Workspace",
      },
      {
        path: "/college-admin/academic-structure",
        label: "Academic Structure",
        icon: GraduationCap,
        group: "Administration",
      },
      {
        path: "/college-admin/staff",
        label: "Manage Staff",
        icon: UserCog,
        group: "Administration",
      },
      {
        path: "/officer/dashboard",
        label: "Placement Overview",
        icon: ClipboardCheck,
        group: "Placement",
      },
      {
        path: "/officer/members",
        label: "Members",
        icon: UsersRound,
        group: "Placement",
      },
      {
        path: "/officer/drives",
        label: "Manage Drives",
        icon: BriefcaseBusiness,
        group: "Placement",
      },
      {
        path: "/officer/companies",
        label: "Manage Companies",
        icon: Building2,
        group: "Placement",
      },
      {
        path: "/officer/guidance",
        label: "Guidance Inbox",
        icon: Handshake,
        group: "Placement",
      },
      {
        path: "/officer/reports",
        label: "Placement Reports",
        icon: LineChart,
        group: "Analytics",
      },
      {
        path: "/officer/verify-data",
        label: "Verify Data",
        icon: ShieldCheck,
        group: "Analytics",
      },
      ...exploreItems,
      profileItem,
    ];
  }

  // ── Placement Officer ────────────────────────────────────────────────────
  if (isOfficer(user)) {
    return [
      {
        path: "/officer/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        group: "Workspace",
      },
      {
        path: "/officer/members",
        label: "Members",
        icon: UsersRound,
        group: "Placement",
      },
      {
        path: "/officer/drives",
        label: "Manage Drives",
        icon: BriefcaseBusiness,
        group: "Placement",
      },
      {
        path: "/officer/companies",
        label: "Manage Companies",
        icon: Building2,
        group: "Placement",
      },
      {
        path: "/officer/guidance",
        label: "Guidance Inbox",
        icon: Handshake,
        group: "Placement",
      },
      {
        path: "/officer/reports",
        label: "Placement Reports",
        icon: BarChart3,
        group: "Analytics",
      },
      {
        path: "/officer/verify-data",
        label: "Verify Data",
        icon: ShieldCheck,
        group: "Analytics",
      },
      ...exploreItems,
      profileItem,
    ];
  }

  // ── Alumni ───────────────────────────────────────────────────────────────
  if (isAlumni(user)) {
    return [
      {
        path: "/alumni/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        group: "Workspace",
      },
      {
        path: "/alumni/career",
        label: "My Career",
        icon: WalletCards,
        group: "Career",
      },
      {
        path: "/alumni/sessions",
        label: "Mentorship Sessions",
        icon: Handshake,
        group: "Career",
      },
      ...exploreItems,
      savedExperiencesItem,
      profileItem,
    ];
  }

  // ── Current Student ──────────────────────────────────────────────────────
  return [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      group: "Workspace",
    },
    {
      path: "/journey",
      label: "Journey Tracker",
      icon: CalendarDays,
      group: "Workspace",
    },
    {
      path: "/guidance/request",
      label: "Request Guidance",
      icon: Handshake,
      group: "Career",
    },
    {
      path: "/guidance/my",
      label: "My Requests",
      icon: MessageSquareMore,
      group: "Career",
    },
    ...exploreItems,
    savedExperiencesItem,
    profileItem,
  ];
};
// ─── Application Stages ───────────────────────────────────────────────────
export const APPLICATION_STAGES = [
    "Applied",
    "Shortlisted",
    "Aptitude Test",
    "Coding Test",
    "Group Discussion",
    "Technical Interview",
    "HR Interview",
    "Management Round",
    "Offer Received",
    "Joined",
    "Rejected",
    "On Hold",
    "Withdrew",
  ];
  
  export const STAGE_COLORS = {
    "Applied":              "badge-gray",
    "Shortlisted":          "badge-indigo",
    "Aptitude Test":        "badge-yellow",
    "Coding Test":          "badge-yellow",
    "Group Discussion":     "badge-yellow",
    "Technical Interview":  "badge-yellow",
    "HR Interview":         "badge-yellow",
    "Management Round":     "badge-yellow",
    "Offer Received":       "badge-green",
    "Joined":               "badge-green",
    "Rejected":             "badge-red",
    "On Hold":              "badge-yellow",
    "Withdrew":             "badge-gray",
  };
  
  // ─── Kanban columns ────────────────────────────────────────────────────────
  export const KANBAN_COLUMNS = [
    { id: "Applied",     label: "Applied",      color: "bg-gray-100   border-gray-300" },
    { id: "Shortlisted", label: "Shortlisted",  color: "bg-indigo-50  border-indigo-300" },
    { id: "Interview",   label: "Interviews",   color: "bg-yellow-50  border-yellow-300" },
    { id: "Offer",       label: "Offer",        color: "bg-green-50   border-green-300" },
    { id: "Rejected",    label: "Rejected",     color: "bg-red-50     border-red-300" },
  ];
  
  // ─── Roles ─────────────────────────────────────────────────────────────────
  export const ROLES = {
    STUDENT: "student",
    SENIOR:  "senior",
    OFFICER: "officer",
    ADMIN:   "admin",
  };
  
  // ─── Branches ──────────────────────────────────────────────────────────────
  export const BRANCHES = [
    "Computer Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Other",
  ];
  
  // ─── Company domains ───────────────────────────────────────────────────────
  export const COMPANY_DOMAINS = [
    "Product",
    "Service",
    "FinTech",
    "EdTech",
    "HealthTech",
    "E-Commerce",
    "Consulting",
    "Core",
    "Other",
  ];
  
  // ─── Round types ───────────────────────────────────────────────────────────
  export const ROUND_TYPES = [
    "Aptitude Test",
    "Coding Test",
    "Group Discussion",
    "Technical Interview",
    "HR Interview",
    "Management Round",
    "Other",
  ];
  
  // ─── Experience outcomes ───────────────────────────────────────────────────
  export const EXPERIENCE_OUTCOMES = ["Selected", "Rejected", "On Hold", "Withdrew"];
  
  // ─── Difficulty levels ─────────────────────────────────────────────────────
  export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];
  
  // ─── Mentor topics ─────────────────────────────────────────────────────────
  export const MENTOR_TOPICS = [
    "Mock Interview",
    "Resume Review",
    "DSA Help",
    "Career Guidance",
    "Company Specific Prep",
    "General Advice",
    "Other",
  ];
  
  // ─── Placement statuses ────────────────────────────────────────────────────
  export const PLACEMENT_STATUSES = [
    { value: "not_started",    label: "Not Started",    color: "badge-gray" },
    { value: "searching",      label: "Searching",      color: "badge-indigo" },
    { value: "placed",         label: "Placed ✅",      color: "badge-green" },
    { value: "higher_studies", label: "Higher Studies", color: "badge-yellow" },
  ];
  
  // ─── Notification types ────────────────────────────────────────────────────
  export const NOTIFICATION_TYPES = {
    new_drive:           { label: "New Drive",            icon: "🏢" },
    application_update:  { label: "Application Update",   icon: "📋" },
    new_experience:      { label: "New Experience",       icon: "📝" },
    booking_confirmed:   { label: "Booking Confirmed",    icon: "✅" },
    booking_cancelled:   { label: "Booking Cancelled",    icon: "❌" },
    slot_reminder:       { label: "Session Reminder",     icon: "⏰" },
    upvote:              { label: "Upvote",               icon: "👍" },
    system:              { label: "System",               icon: "🔔" },
  };
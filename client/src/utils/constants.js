// ─── System Roles ──────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN:   "superAdmin",
  COLLEGE_ADMIN: "collegeAdmin",
  OFFICER:       "officer",
  MEMBER:        "member",
};

// ─── Academic Status ───────────────────────────────────────────────────────
export const ACADEMIC_STATUS = {
  ENROLLED:       "ENROLLED",
  FINAL_YEAR:     "FINAL_YEAR",
  GRADUATED:      "GRADUATED",
  NOT_APPLICABLE: "NOT_APPLICABLE",
};

export const ACADEMIC_STATUS_LABELS = {
  ENROLLED:       "Current Student",
  FINAL_YEAR:     "Final Year Student",
  GRADUATED:      "Alumni",
  NOT_APPLICABLE: "Staff",
};

export const ACADEMIC_STATUS_COLORS = {
  ENROLLED:       "badge-indigo",
  FINAL_YEAR:     "badge-yellow",
  GRADUATED:      "badge-green",
  NOT_APPLICABLE: "badge-gray",
};

// ─── Placement Status ──────────────────────────────────────────────────────
export const PLACEMENT_STATUS = [
  { value: "UNPLACED",         label: "Unplaced",          color: "badge-gray"   },
  { value: "SEARCHING",        label: "Actively Searching", color: "badge-indigo" },
  { value: "PLACED",           label: "Placed ✅",          color: "badge-green"  },
  { value: "HIGHER_STUDIES",   label: "Higher Studies",     color: "badge-yellow" },
  { value: "NOT_PARTICIPATING",label: "Not Participating",  color: "badge-gray"   },
  { value: "NOT_APPLICABLE",   label: "N/A",                color: "badge-gray"   },
];

// ─── Employment Status ─────────────────────────────────────────────────────
export const EMPLOYMENT_STATUS = [
  { value: "STUDENT",         label: "Student"         },
  { value: "INTERN",          label: "Intern"          },
  { value: "WORKING",         label: "Working"         },
  { value: "SEEKING",         label: "Seeking"         },
  { value: "HIGHER_STUDIES",  label: "Higher Studies"  },
  { value: "NOT_APPLICABLE",  label: "N/A"             },
];

// ─── Application Stages ────────────────────────────────────────────────────
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
  "Applied":             "badge-gray",
  "Shortlisted":         "badge-indigo",
  "Aptitude Test":       "badge-yellow",
  "Coding Test":         "badge-yellow",
  "Group Discussion":    "badge-yellow",
  "Technical Interview": "badge-yellow",
  "HR Interview":        "badge-yellow",
  "Management Round":    "badge-yellow",
  "Offer Received":      "badge-green",
  "Joined":              "badge-green",
  "Rejected":            "badge-red",
  "On Hold":             "badge-yellow",
  "Withdrew":            "badge-gray",
};

// ─── Drive Status ──────────────────────────────────────────────────────────
export const DRIVE_STATUS = [
  { value: "UPCOMING",   label: "Upcoming",   color: "badge-indigo" },
  { value: "ACTIVE",     label: "Active",     color: "badge-green"  },
  { value: "COMPLETED",  label: "Completed",  color: "badge-gray"   },
  { value: "CANCELLED",  label: "Cancelled",  color: "badge-red"    },
];

export const DRIVE_TYPES = [
  { value: "ON_CAMPUS",   label: "On Campus"    },
  { value: "OFF_CAMPUS",  label: "Off Campus"   },
  { value: "POOL_CAMPUS", label: "Pool Campus"  },
  { value: "VIRTUAL",     label: "Virtual"      },
];

// ─── Guidance Request Status ───────────────────────────────────────────────
export const GUIDANCE_STATUS = {
  PENDING_REVIEW:    { label: "Pending Review",     color: "badge-yellow" },
  ALUMNI_CONTACTED:  { label: "Alumni Contacted",   color: "badge-indigo" },
  ALUMNI_ACCEPTED:   { label: "Alumni Accepted",    color: "badge-green"  },
  ALUMNI_DECLINED:   { label: "Alumni Declined",    color: "badge-red"    },
  SESSION_SCHEDULED: { label: "Session Scheduled",  color: "badge-green"  },
  COMPLETED:         { label: "Completed",           color: "badge-gray"   },
  CLOSED:            { label: "Closed",              color: "badge-gray"   },
};

export const GUIDANCE_TOPICS = [
  "Interview Preparation",
  "Resume Review",
  "DSA Help",
  "Career Guidance",
  "Company Specific Prep",
  "Mock Interview",
  "General Advice",
  "Other",
];

export const MENTORSHIP_SESSION_TYPES = [
  "Mock Interview",
  "Resume Review",
  "Company Prep",
  "DSA Session",
  "Career Guidance",
  "Group Webinar",
  "Q&A Session",
  "Other",
];

// ─── Company Industry ──────────────────────────────────────────────────────
export const COMPANY_INDUSTRIES = [
  "Product",
  "Service",
  "FinTech",
  "EdTech",
  "HealthTech",
  "E-Commerce",
  "Consulting",
  "Core Engineering",
  "Banking & Finance",
  "Government / PSU",
  "Startup",
  "Other",
];

// ─── Degree Types ──────────────────────────────────────────────────────────
export const DEGREE_TYPES = [
  "B.Tech","M.Tech","BCA","MCA","B.Sc","M.Sc",
  "MBA","B.E","M.E","Diploma","Ph.D","Other",
];

// ─── Institution Types ─────────────────────────────────────────────────────
export const INSTITUTION_TYPES = [
  "University",
  "Deemed University",
  "Autonomous College",
  "Affiliated College",
  "Institute of Technology",
  "Polytechnic",
  "Other",
];

// ─── Experience ────────────────────────────────────────────────────────────
export const EXPERIENCE_OUTCOMES = ["Selected","Rejected","On Hold","Withdrew"];
export const DIFFICULTY_LEVELS   = ["Easy","Medium","Hard"];

export const ROUND_TYPES = [
  "Aptitude Test",
  "Coding Test",
  "Group Discussion",
  "Technical Interview",
  "HR Interview",
  "Management Round",
  "Other",
];

// ─── Notification Types ────────────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  new_drive:               { label: "New Drive",              icon: "🏢" },
  application_update:      { label: "Application Update",     icon: "📋" },
  new_experience:          { label: "New Experience",         icon: "📝" },
  guidance_request_update: { label: "Guidance Update",        icon: "🤝" },
  session_scheduled:       { label: "Session Scheduled",      icon: "📅" },
  session_cancelled:       { label: "Session Cancelled",      icon: "❌" },
  session_reminder:        { label: "Session Reminder",       icon: "⏰" },
  upvote:                  { label: "Upvote",                 icon: "👍" },
  alumni_contacted:        { label: "Alumni Contacted",       icon: "📬" },
  system:                  { label: "System",                 icon: "🔔" },
};

// ─── Employment Types ─────────────────────────────────────────────────────
export const EMPLOYMENT_TYPES = [
  "Full-Time","Part-Time","Intern","Contract","Freelance",
];

// ─── Indian States (for address) ──────────────────────────────────────────
export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];
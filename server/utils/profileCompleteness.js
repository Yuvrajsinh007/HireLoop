const computeProfileCompleteness = (user, profile) => {
  const missing = [];
  const checks = [
    { ok: Boolean(user?.name), label: "Full name" },
    { ok: Boolean(user?.phone || profile?.phone), label: "Phone number" },
    { ok: Boolean(profile?.rollNumber), label: "Roll number" },
    { ok: Boolean(profile?.academicUnit), label: "Institute / academic unit" },
    { ok: Boolean(profile?.program), label: "Program" },
    { ok: Boolean(profile?.enrollmentYear), label: "Enrollment year" },
    { ok: Boolean(profile?.graduationYear), label: "Graduation year" },
    { ok: profile?.cgpa !== null && profile?.cgpa !== undefined && profile?.cgpa !== "", label: "CGPA" },
    { ok: profile?.activeBacklogs !== null && profile?.activeBacklogs !== undefined, label: "Active backlogs" },
    { ok: Boolean(profile?.resumeUrl), label: "Resume" },
    {
      ok:
        (profile?.skills || []).length > 0 ||
        (profile?.technicalSkills || []).length > 0 ||
        (profile?.programmingLanguages || []).length > 0,
      label: "Skills",
    },
    { ok: Boolean(profile?.linkedIn || profile?.github || profile?.portfolio), label: "Professional links" },
  ];

  checks.forEach((c) => {
    if (!c.ok) missing.push(c.label);
  });

  const percent = Math.round(((checks.length - missing.length) / checks.length) * 100);
  return { percent, missing };
};

module.exports = { computeProfileCompleteness };

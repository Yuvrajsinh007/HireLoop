const Program = require("../models/Program");

const VISIBLE_DRIVE_STATUSES = ["UPCOMING", "ACTIVE"];

const isStudentEligibleForDrive = (profile, drive, programDoc = null) => {
  if (!profile || !drive) return false;

  const programs = (drive.eligiblePrograms || []).map((p) => p.toString());
  if (programs.length > 0) {
    if (!profile.program) return false;
    if (!programs.includes(profile.program.toString())) return false;
  }

  const units = (drive.eligibleAcademicUnits || []).map((u) => u.toString());
  if (units.length > 0) {
    if (!profile.academicUnit) return false;
    if (!units.includes(profile.academicUnit.toString())) return false;
  }

  const degrees = drive.eligibleDegreeTypes || [];
  if (degrees.length > 0) {
    const degree = programDoc?.degreeType;
    if (!degree || !degrees.includes(degree)) return false;
  }

  const minCgpa = Number(drive.minCGPA || 0);
  if (minCgpa > 0) {
    if (profile.cgpa === null || profile.cgpa === undefined) return false;
    if (Number(profile.cgpa) < minCgpa) return false;
  }

  const maxBacklogs = drive.maxBacklogs;
  if (maxBacklogs !== null && maxBacklogs !== undefined) {
    if (Number(profile.activeBacklogs || 0) > Number(maxBacklogs)) return false;
  }

  const years = drive.graduationYears || [];
  if (years.length > 0) {
    if (!profile.graduationYear) return false;
    if (!years.includes(Number(profile.graduationYear))) return false;
  }

  return true;
};

const loadProgramMap = async (profiles) => {
  const ids = [
    ...new Set(
      profiles.map((p) => p.program?.toString()).filter(Boolean)
    ),
  ];
  if (!ids.length) return {};
  const programs = await Program.find({ _id: { $in: ids } }).select("degreeType name");
  return Object.fromEntries(programs.map((p) => [p._id.toString(), p]));
};

const studentDriveVisibleStatuses = () => VISIBLE_DRIVE_STATUSES;

module.exports = {
  isStudentEligibleForDrive,
  loadProgramMap,
  studentDriveVisibleStatuses,
};

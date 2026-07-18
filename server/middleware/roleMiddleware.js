const { errorResponse } = require("../utils/apiResponse");

/**
 * AUTHORIZE MIDDLEWARE
 * Restricts access to specific system roles.
 *
 * Roles:
 *   superAdmin   - Platform owner
 *   collegeAdmin - Institution admin
 *   officer      - Placement operations
 *   member       - Student or Alumni (differentiated by academicStatus)
 *
 * Usage:
 *   router.post("/", protect, authorize("officer", "collegeAdmin"), createDrive);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Required: ${roles.join(" or ")}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

/**
 * AUTHORIZE ALUMNI ONLY
 * Checks that the member's academicStatus is GRADUATED.
 * Must be used after protect middleware.
 */
const authorizeAlumni = (req, res, next) => {
  if (!req.user) return errorResponse(res, 401, "Not authenticated");
  if (req.user.role !== "member") return errorResponse(res, 403, "Members only");
  if (req.user.academicStatus !== "GRADUATED") {
    return errorResponse(res, 403, "This action is only available to alumni");
  }
  next();
};

/**
 * AUTHORIZE CURRENT STUDENT ONLY
 * Checks that the member's academicStatus is ENROLLED or FINAL_YEAR.
 */
const authorizeStudent = (req, res, next) => {
  if (!req.user) return errorResponse(res, 401, "Not authenticated");
  if (req.user.role !== "member") return errorResponse(res, 403, "Members only");
  if (!["ENROLLED", "FINAL_YEAR"].includes(req.user.academicStatus)) {
    return errorResponse(res, 403, "This action is only available to current students");
  }
  next();
};

/**
 * AUTHORIZE COLLEGE STAFF
 * Allows both collegeAdmin and officer.
 */
const authorizeStaff = (req, res, next) => {
  if (!req.user) return errorResponse(res, 401, "Not authenticated");
  if (!["collegeAdmin", "officer", "superAdmin"].includes(req.user.role)) {
    return errorResponse(res, 403, "College staff access required");
  }
  next();
};

module.exports = { authorize, authorizeAlumni, authorizeStudent, authorizeStaff };
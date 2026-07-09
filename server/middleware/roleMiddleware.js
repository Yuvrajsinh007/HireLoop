const { errorResponse } = require("../utils/apiResponse");

/**
 * Restrict access to specific roles
 * Usage: authorize("admin", "officer")
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
        `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

module.exports = { authorize };
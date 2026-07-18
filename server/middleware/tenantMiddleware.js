const { errorResponse } = require("../utils/apiResponse");

/**
 * TENANT MIDDLEWARE
 *
 * Automatically injects req.institutionId from the authenticated user.
 * Must be used AFTER the protect middleware.
 *
 * Usage in routes:
 *   router.get("/", protect, injectTenant, getCompanies);
 *
 * In controllers, always filter queries with:
 *   { institution: req.institutionId }
 *
 * This prevents any cross-tenant data access.
 */
const injectTenant = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, "Not authenticated");
  }

  // superAdmin has no institution — they see everything
  if (req.user.role === "superAdmin") {
    req.institutionId = null;
    req.isSuperAdmin  = true;
    return next();
  }

  if (!req.user.institution) {
    return errorResponse(res, 403, "User is not associated with any institution");
  }

  req.institutionId = req.user.institution;
  req.isSuperAdmin  = false;
  next();
};

/**
 * REQUIRE TENANT
 *
 * Blocks superAdmin from accessing tenant-specific routes.
 * Use when an endpoint MUST have an institution context.
 */
const requireTenant = (req, res, next) => {
  if (!req.institutionId) {
    return errorResponse(res, 403, "This endpoint requires an institution context");
  }
  next();
};

/**
 * TENANT QUERY HELPER
 *
 * Returns a base filter object that always includes institutionId.
 * Use this in every controller to build queries safely:
 *
 * const filter = tenantFilter(req, { isActive: true });
 * const companies = await Company.find(filter);
 */
const tenantFilter = (req, extraFilter = {}) => {
  if (req.isSuperAdmin) return extraFilter;
  return { institution: req.institutionId, ...extraFilter };
};

/**
 * VERIFY OBJECT BELONGS TO TENANT
 *
 * Checks that a fetched document's institution matches req.institutionId.
 * Prevents IDOR attacks where a user guesses another tenant's object ID.
 *
 * Usage:
 *   const company = await Company.findById(id);
 *   if (!verifyTenantOwnership(req, company)) return errorResponse(res, 403, ...);
 */
const verifyTenantOwnership = (req, document) => {
  if (!document) return false;
  if (req.isSuperAdmin) return true;
  const docInstitution = document.institution?.toString() || document.institutionId?.toString();
  return docInstitution === req.institutionId?.toString();
};

module.exports = { injectTenant, requireTenant, tenantFilter, verifyTenantOwnership };
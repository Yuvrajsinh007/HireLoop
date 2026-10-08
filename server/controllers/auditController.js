const AuditLog = require("../models/AuditLog");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter } = require("../middleware/tenantMiddleware");

// GET /api/audit
const getAuditLogs = async (req, res) => {
  try {
    const { action, resource, userId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // For superAdmin, they might view across tenants if they don't have an institutionId.
    // tenantFilter gracefully handles this if req.isSuperAdmin is set.
    const filter = tenantFilter(req, {});
    
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.user = userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter)
    ]);

    return successResponse(res, 200, "Audit logs fetched", {
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// GET /api/audit/:id
const getAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findOne(tenantFilter(req, { _id: req.params.id }))
      .populate("user", "name email role");

    if (!log) return errorResponse(res, 404, "Audit log not found");
    return successResponse(res, 200, "Audit log fetched", log);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getAuditLogs,
  getAuditLog
};

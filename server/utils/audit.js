const AuditLog = require("../models/AuditLog");

const writeAudit = async (req, { action, entity, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      user: req.user?._id || null,
      role: req.user?.role || "",
      institution: req.institutionId || req.user?.institution?._id || null,
      action,
      entity,
      entityId: entityId ? String(entityId) : "",
      ip: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.get?.("user-agent") || "",
      meta,
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
};

module.exports = { writeAudit };

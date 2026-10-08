const express = require("express");
const router  = express.Router();
const { getAuditLogs, getAuditLog } = require("../controllers/auditController");

const { protect } = require("../middleware/authMiddleware");
const { injectTenant } = require("../middleware/tenantMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect, injectTenant, authorize("superAdmin", "collegeAdmin"));

router.get("/", getAuditLogs);
router.get("/:id", getAuditLog);

module.exports = router;

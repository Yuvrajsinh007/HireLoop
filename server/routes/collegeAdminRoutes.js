const express = require("express");
const router  = express.Router();
const {
  createOfficer,
  updateOfficer,
  deactivateOfficer,
  getDomains,
  addDomain,
  verifyDomain,
  removeDomain
} = require("../controllers/collegeAdminController");

const { protect } = require("../middleware/authMiddleware");
const { injectTenant } = require("../middleware/tenantMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect, injectTenant, authorize("collegeAdmin"));

// ── Officers ──────────────────────────────────────────────────────────────
router.post("/officers", createOfficer);
router.put("/officers/:id", updateOfficer);
router.delete("/officers/:id/deactivate", deactivateOfficer);

// ── Domains ───────────────────────────────────────────────────────────────
router.get("/domains", getDomains);
router.post("/domains", addDomain);
router.put("/domains/:id/verify", verifyDomain);
router.delete("/domains/:id", removeDomain);

module.exports = router;

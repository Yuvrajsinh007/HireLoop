const express = require("express");
const router  = express.Router();
const {
  getDrives, getDrive, getEligibleDrives,
  createDrive, updateDrive, deleteDrive,
  sendDriveAlert, getDriveApplications,
} = require("../controllers/driveController");
const { protect }        = require("../middleware/authMiddleware");
const { injectTenant }   = require("../middleware/tenantMiddleware");
const { authorize, authorizeStaff } = require("../middleware/roleMiddleware");

router.use(protect, injectTenant);

// ── All members can view drives ───────────────────────────────────────────
router.get("/",          getDrives);
router.get("/eligible",  getEligibleDrives);
router.get("/:id",       getDrive);

// ── Officer/Admin manage drives ───────────────────────────────────────────
router.post("/",                    authorizeStaff, createDrive);
router.put("/:id",                  authorizeStaff, updateDrive);
router.post("/:id/send-alert",      authorizeStaff, sendDriveAlert);
router.get("/:id/applications",     authorizeStaff, getDriveApplications);
router.delete("/:id",               authorize("collegeAdmin","superAdmin"), deleteDrive);

module.exports = router;
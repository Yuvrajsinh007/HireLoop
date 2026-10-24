const express = require("express");
const router  = express.Router();

const {
  getDrives, getDrive, getEligibleDrives,
  createDrive, updateDrive, deleteDrive,
  sendDriveAlert, getDriveApplications,
} = require("../controllers/driveController");

// Import the apply controller here!
const { addApplication } = require("../controllers/applicationController"); 

const { protect }        = require("../middleware/authMiddleware");
const { injectTenant }   = require("../middleware/tenantMiddleware");
const { authorize, authorizeStaff } = require("../middleware/roleMiddleware");

router.use(protect, injectTenant);

// ── Student-Specific Routes ───────────────────────────────────────────────
router.get("/eligible",  authorize("member", "student"), getEligibleDrives);
router.post("/:id/apply", authorize("member", "student"), addApplication);

// ── Shared/View Routes ────────────────────────────────────────────────────
router.get("/",          getDrives);
router.get("/:id",       getDrive);

// ── Officer/Admin Manage Drives ───────────────────────────────────────────
router.post("/",                    authorizeStaff, createDrive);
router.put("/:id",                  authorizeStaff, updateDrive);
router.post("/:id/send-alert",      authorizeStaff, sendDriveAlert);
router.get("/:id/applications",     authorizeStaff, getDriveApplications);
router.delete("/:id",               authorize("collegeAdmin","superAdmin"), deleteDrive);

module.exports = router;
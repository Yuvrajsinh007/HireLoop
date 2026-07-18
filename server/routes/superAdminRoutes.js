const express = require("express");
const router  = express.Router();
const {
  getAllInstitutions, getInstitution,
  registerInstitution,
  approveInstitution, rejectInstitution,
  suspendInstitution, reactivateInstitution,
  getPlatformStats, getAllUsers,
} = require("../controllers/superAdminController");
const { protect }   = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// ── Public ────────────────────────────────────────────────────────────────
router.post("/institutions/register", registerInstitution);

// ── SuperAdmin only ───────────────────────────────────────────────────────
router.use(protect, authorize("superAdmin"));

router.get("/stats",                              getPlatformStats);
router.get("/institutions",                       getAllInstitutions);
router.get("/institutions/:id",                   getInstitution);
router.put("/institutions/:id/approve",           approveInstitution);
router.put("/institutions/:id/reject",            rejectInstitution);
router.put("/institutions/:id/suspend",           suspendInstitution);
router.put("/institutions/:id/reactivate",        reactivateInstitution);
router.get("/users",                              getAllUsers);

module.exports = router;
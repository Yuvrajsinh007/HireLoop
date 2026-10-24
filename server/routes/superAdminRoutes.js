const express = require("express");
const router = express.Router();

const { registerInstitution } = require("../controllers/institutionController");
const {
  getAllInstitutions,
  getInstitution,
  createInstitution,
  approveInstitution,
  rejectInstitution,
  suspendInstitution,
  reactivateInstitution,
  getPlatformStats,
  getAllUsers,
} = require("../controllers/superAdminController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Institution Registration (Creates Temporary Request Record)
// POST /api/super-admin/institutions/register
// ─────────────────────────────────────────────────────────────────────────────
router.post("/institutions/register", registerInstitution);

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN PROTECTED ROUTES
// ─────────────────────────────────────────────────────────────────────────────
router.use(protect, authorize("superAdmin"));

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);

router.get("/institutions", getAllInstitutions);
router.get("/institutions/:id", getInstitution);
router.post("/institutions", createInstitution);

router.put("/institutions/:id/approve", approveInstitution);
router.put("/institutions/:id/reject", rejectInstitution);
router.put("/institutions/:id/suspend", suspendInstitution);
router.put("/institutions/:id/reactivate", reactivateInstitution);

module.exports = router;
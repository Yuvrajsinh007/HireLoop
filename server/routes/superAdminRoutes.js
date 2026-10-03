const express = require("express");

const router = express.Router();

const {
  registerInstitution,
  getAllInstitutions,
  getInstitution,
  createInstitution,
  suspendInstitution,
  reactivateInstitution,
  getPlatformStats,
  getAllUsers,
} = require("../controllers/superAdminController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  authorize,
} = require("../middleware/roleMiddleware");

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Institution Registration
// No login required
// POST /api/super-admin/institutions/register
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/institutions/register",
  registerInstitution
);

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN ONLY
// ─────────────────────────────────────────────────────────────────────────────
router.use(
  protect,
  authorize("superAdmin")
);

// Platform Statistics
router.get(
  "/stats",
  getPlatformStats
);

// Global Users
router.get(
  "/users",
  getAllUsers
);

// Institution Management
router.get(
  "/institutions",
  getAllInstitutions
);

router.get(
  "/institutions/:id",
  getInstitution
);

router.post(
  "/institutions",
  createInstitution
);

router.put(
  "/institutions/:id/suspend",
  suspendInstitution
);

router.put(
  "/institutions/:id/reactivate",
  reactivateInstitution
);

module.exports = router;
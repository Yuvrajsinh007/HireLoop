const express = require("express");
const router  = express.Router();
const {
  getDashboard,
  getMembers, getMember, updateMemberStatus,
  graduateBatch,
  getPlacementReport,
  getStaff, updateUser,
} = require("../controllers/officerController");
const { protect }        = require("../middleware/authMiddleware");
const { injectTenant }   = require("../middleware/tenantMiddleware");
const { authorize, authorizeStaff } = require("../middleware/roleMiddleware");

router.use(protect, injectTenant);

// ── Dashboard ─────────────────────────────────────────────────────────────
router.get("/dashboard",          authorizeStaff, getDashboard);

// ── Members ───────────────────────────────────────────────────────────────
router.get("/members",            authorizeStaff, getMembers);
router.get("/members/:userId",    authorizeStaff, getMember);
router.put("/members/:userId/status", authorizeStaff, updateMemberStatus);

// ── Batch graduation (admin only) ─────────────────────────────────────────
router.post("/graduate-batch",    authorize("collegeAdmin","superAdmin"), graduateBatch);

// ── Reports ───────────────────────────────────────────────────────────────
router.get("/reports",            authorizeStaff, getPlacementReport);

// ── Staff management (admin only) ────────────────────────────────────────
router.get("/staff",              authorize("collegeAdmin","superAdmin"), getStaff);
router.put("/users/:id",          authorize("collegeAdmin","superAdmin"), updateUser);

module.exports = router;
const express = require("express");
const router  = express.Router();
const {
  getProfile, updateProfile, uploadAvatar, uploadResume,
  getDashboardStats, getAlumniStats,
  getEmploymentHistory, addEmployment, updateEmployment, deleteEmployment,
  saveExperience, unsaveExperience, getSavedExperiences,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} = require("../controllers/memberController");
const { protect }       = require("../middleware/authMiddleware");
const { injectTenant }  = require("../middleware/tenantMiddleware");
const { authorize }     = require("../middleware/roleMiddleware");
const { uploadSingle }  = require("../middleware/uploadMiddleware");

router.use(protect, injectTenant);

// ── Profile ──────────────────────────────────────────────────────────────
router.get("/profile",   getProfile);
router.put("/profile",   updateProfile);
router.post("/avatar",   uploadSingle("avatar"), uploadAvatar);
router.post("/resume",   uploadSingle("resume"), uploadResume);

// ── Dashboard stats ───────────────────────────────────────────────────────
router.get("/dashboard-stats", getDashboardStats);
router.get("/alumni-stats",    getAlumniStats);

// ── Employment history (alumni) ───────────────────────────────────────────
router.get("/employment",         getEmploymentHistory);
router.post("/employment",        addEmployment);
router.put("/employment/:id",     updateEmployment);
router.delete("/employment/:id",  deleteEmployment);

// ── Saved experiences ─────────────────────────────────────────────────────
router.get("/saved-experiences",        getSavedExperiences);
router.post("/save-experience/:id",     saveExperience);
router.delete("/save-experience/:id",   unsaveExperience);

// ── Notifications ─────────────────────────────────────────────────────────
router.get("/notifications",              getNotifications);
router.put("/notifications/read-all",     markAllNotificationsRead);
router.put("/notifications/:id/read",     markNotificationRead);

module.exports = router;
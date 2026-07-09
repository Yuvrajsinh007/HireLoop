const express = require("express");
const router = express.Router();
const {
  getProfile, updateProfile, uploadAvatar, uploadResume,
  getDashboardStats, saveExperience, unsaveExperience, getSavedExperiences,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");

router.use(protect); // All student routes are protected

router.get("/profile",          getProfile);
router.put("/profile",          updateProfile);
router.post("/avatar",          uploadSingle("avatar"), uploadAvatar);
router.post("/resume",          uploadSingle("resume"), uploadResume);
router.get("/dashboard-stats",  getDashboardStats);
router.get("/saved-experiences",getSavedExperiences);
router.post("/save-experience/:id",   saveExperience);
router.delete("/save-experience/:id", unsaveExperience);
router.get("/notifications",              getNotifications);
router.put("/notifications/:id/read",     markNotificationRead);
router.put("/notifications/read-all",     markAllNotificationsRead);

module.exports = router;
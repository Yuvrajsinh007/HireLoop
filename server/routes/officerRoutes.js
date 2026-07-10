const express = require("express");
const router  = express.Router();
const {
  getDashboard, getStudents, sendDriveAlert,
  getPlacementReport, getAllUsers, updateUser, verifyExperience,
} = require("../controllers/officerController");
const { protect }   = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

// Officer + Admin
router.get("/dashboard",        authorize("officer","admin"), getDashboard);
router.get("/students",         authorize("officer","admin"), getStudents);
router.post("/send-drive-alert",authorize("officer","admin"), sendDriveAlert);
router.get("/reports",          authorize("officer","admin"), getPlacementReport);

// Admin only
router.get("/admin/users",                    authorize("admin"), getAllUsers);
router.put("/admin/users/:id",                authorize("admin"), updateUser);
router.put("/admin/experiences/:id/verify",   authorize("admin"), verifyExperience);

module.exports = router;
const express = require("express");
const router  = express.Router();
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require("../controllers/announcementController");

const { protect } = require("../middleware/authMiddleware");
const { injectTenant } = require("../middleware/tenantMiddleware");
const { authorizeStaff } = require("../middleware/roleMiddleware");

router.use(protect, injectTenant);

// Members can read announcements, staff can manage them.
router.get("/", getAnnouncements);
router.get("/:id", getAnnouncement);

router.post("/", authorizeStaff, createAnnouncement);
router.put("/:id", authorizeStaff, updateAnnouncement);
router.delete("/:id", authorizeStaff, deleteAnnouncement);

module.exports = router;

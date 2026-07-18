const express = require("express");
const router  = express.Router();
const {
  getMyApplications,
  addApplication,
  updateStage,
  updateApplication,
  deleteApplication,
  getApplication,
} = require("../controllers/applicationController");
const { protect }      = require("../middleware/authMiddleware");
const { injectTenant } = require("../middleware/tenantMiddleware");

router.use(protect, injectTenant);

router.get("/my",        getMyApplications);
router.post("/",         addApplication);
router.get("/:id",       getApplication);
router.put("/:id",       updateApplication);
router.put("/:id/stage", updateStage);
router.delete("/:id",    deleteApplication);

module.exports = router;
const express = require("express");
const router  = express.Router();
const {
  getMyApplications,
  addApplication,
  updateStage,
  updateApplication,
  deleteApplication,
  getApplication,
  uploadOfferLetter,
  verifyOffer
} = require("../controllers/applicationController");
const { protect }      = require("../middleware/authMiddleware");
const { injectTenant } = require("../middleware/tenantMiddleware");
const { authorizeStaff } = require("../middleware/roleMiddleware");

router.use(protect, injectTenant);

router.get("/my",        getMyApplications);
router.post("/",         addApplication);
router.get("/:id",       getApplication);
router.put("/:id",       updateApplication);
router.put("/:id/stage", updateStage);
router.delete("/:id",    deleteApplication);

router.post("/:id/offer", uploadOfferLetter);
router.put("/:id/verify-offer", authorizeStaff, verifyOffer);

module.exports = router;
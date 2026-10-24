const express = require("express");
const router  = express.Router();
const {
  getMyApplications,
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
router.get("/:id",       getApplication);
router.put("/:id",       updateApplication);
router.put("/:id/stage", authorizeStaff, updateStage);
router.delete("/:id",    deleteApplication);

// Offer Letter Management
router.post("/:id/offer", uploadOfferLetter);
router.put("/:id/verify-offer", authorizeStaff, verifyOffer);

module.exports = router;
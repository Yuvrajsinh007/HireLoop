const express = require("express");
const router  = express.Router();
const {
  getCompanies, getCompany, searchCompanies,
  createCompany, updateCompany, deleteCompany,
  uploadLogo, rateCompany,
} = require("../controllers/companyController");
const { protect }    = require("../middleware/authMiddleware");
const { authorize }  = require("../middleware/roleMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");

// Public (still need login to browse)
router.get("/",          protect, getCompanies);
router.get("/search",    protect, searchCompanies);
router.get("/:id",       protect, getCompany);
router.post("/:id/rate", protect, rateCompany);

// Officer / Admin only
router.post("/",              protect, authorize("officer","admin"), createCompany);
router.put("/:id",            protect, authorize("officer","admin"), updateCompany);
router.post("/:id/logo",      protect, authorize("officer","admin"), uploadSingle("logo"), uploadLogo);
router.delete("/:id",         protect, authorize("admin"),           deleteCompany);

module.exports = router;
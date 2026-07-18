const express = require("express");
const router  = express.Router();
const {
  getCompanies, getCompany, searchCompanies,
  createCompany, updateCompany, deleteCompany,
  uploadLogo, getCompanyDrives,
} = require("../controllers/companyController");
const { protect }      = require("../middleware/authMiddleware");
const { injectTenant } = require("../middleware/tenantMiddleware");
const { authorize }    = require("../middleware/roleMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");

router.use(protect, injectTenant);

// ── All authenticated users can browse global company list ────────────────
router.get("/",           getCompanies);
router.get("/search",     searchCompanies);
router.get("/:id",        getCompany);
router.get("/:id/drives", getCompanyDrives);

// ── Officers and College Admins can create/edit companies ─────────────────
router.post("/",              authorize("officer","collegeAdmin","superAdmin"), createCompany);
router.put("/:id",            authorize("officer","collegeAdmin","superAdmin"), updateCompany);
router.post("/:id/logo",      authorize("officer","collegeAdmin","superAdmin"), uploadSingle("logo"), uploadLogo);
router.delete("/:id",         authorize("collegeAdmin","superAdmin"),           deleteCompany);

module.exports = router;
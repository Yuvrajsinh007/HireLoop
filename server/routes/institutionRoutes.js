const express = require("express");
const router  = express.Router();
const {
  lookupDomain,
  getMyInstitution, updateMyInstitution,
  getDomains, addDomain, removeDomain,
  getAcademicUnits, createAcademicUnit, updateAcademicUnit, deleteAcademicUnit,
  getPrograms, createProgram, updateProgram, deleteProgram,
} = require("../controllers/institutionController");
const { protect }      = require("../middleware/authMiddleware");
const { injectTenant } = require("../middleware/tenantMiddleware");
const { authorize }    = require("../middleware/roleMiddleware");

// ── Public (no auth needed) ───────────────────────────────────────────────
router.get("/lookup-domain", lookupDomain);

// ── Protected + Tenant injected ───────────────────────────────────────────
router.use(protect, injectTenant);

// ── Institution profile (all staff can view, only admin can edit) ─────────
router.get("/me",  getMyInstitution);
router.put("/me",  authorize("collegeAdmin"), updateMyInstitution);

// ── Domains (admin only) ──────────────────────────────────────────────────
router.get("/domains",        authorize("collegeAdmin"), getDomains);
router.post("/domains",       authorize("collegeAdmin"), addDomain);
router.delete("/domains/:id", authorize("collegeAdmin"), removeDomain);

// ── Academic Units (admin can CRUD, officer/member can read) ──────────────
router.get("/academic-units",        getAcademicUnits);
router.post("/academic-units",       authorize("collegeAdmin"), createAcademicUnit);
router.put("/academic-units/:id",    authorize("collegeAdmin"), updateAcademicUnit);
router.delete("/academic-units/:id", authorize("collegeAdmin"), deleteAcademicUnit);

// ── Programs (admin can CRUD, officer/member can read) ────────────────────
router.get("/programs",        getPrograms);
router.post("/programs",       authorize("collegeAdmin"), createProgram);
router.put("/programs/:id",    authorize("collegeAdmin"), updateProgram);
router.delete("/programs/:id", authorize("collegeAdmin"), deleteProgram);

module.exports = router;
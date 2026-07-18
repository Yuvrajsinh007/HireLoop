const express = require("express");
const router  = express.Router();
const {
  submitRequest, getMyRequests, getMySessions, submitStudentFeedback,
  getAllRequests, assignAlumni, updateRequestStatus,
  createSession, getAllSessions, updateSession, suggestAlumni,
  getAlumniSessions,
} = require("../controllers/guidanceController");
const { protect }         = require("../middleware/authMiddleware");
const { injectTenant }    = require("../middleware/tenantMiddleware");
const { authorizeStaff }  = require("../middleware/roleMiddleware");

router.use(protect, injectTenant);

// ── Student routes ────────────────────────────────────────────────────────
router.post("/",                          submitRequest);
router.get("/my",                         getMyRequests);
router.get("/my-sessions",                getMySessions);
router.post("/sessions/:id/feedback",     submitStudentFeedback);

// ── Alumni routes ─────────────────────────────────────────────────────────
router.get("/alumni/sessions",            getAlumniSessions);

// ── Officer / Admin routes ────────────────────────────────────────────────
router.get("/officer/requests",                          authorizeStaff, getAllRequests);
router.put("/officer/requests/:id/assign-alumni",        authorizeStaff, assignAlumni);
router.put("/officer/requests/:id/status",               authorizeStaff, updateRequestStatus);
router.get("/officer/requests/:id/suggest-alumni",       authorizeStaff, suggestAlumni);
router.post("/officer/sessions",                         authorizeStaff, createSession);
router.get("/officer/sessions",                          authorizeStaff, getAllSessions);
router.put("/officer/sessions/:id",                      authorizeStaff, updateSession);

module.exports = router;
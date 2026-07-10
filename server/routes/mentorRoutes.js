const express = require("express");
const router  = express.Router();
const {
  getMentors, getMySlots, createSlot, updateSlot, deleteSlot,
  bookSlot, getMyBookings, cancelBooking, submitFeedback,
} = require("../controllers/mentorController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/",                          getMentors);
router.get("/my-slots",                  getMySlots);
router.get("/my-bookings",               getMyBookings);
router.post("/slots",                    createSlot);
router.put("/slots/:id",                 updateSlot);
router.delete("/slots/:id",              deleteSlot);
router.post("/slots/:id/book",           bookSlot);
router.put("/bookings/:id/cancel",       cancelBooking);
router.put("/bookings/:id/feedback",     submitFeedback);

module.exports = router;
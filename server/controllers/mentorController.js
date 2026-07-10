const MentorSlot  = require("../models/MentorSlot");
const Booking     = require("../models/Booking");
const Student     = require("../models/Student");
const Notification= require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── GET ALL AVAILABLE MENTORS ────────────────────────────────────────────
// GET /api/mentors
const getMentors = async (req, res) => {
  try {
    const { topic, date } = req.query;

    const filter = {
      isBooked: false,
      status: "available",
      date: { $gte: new Date() },
    };
    if (topic) filter.topic = topic;
    if (date)  filter.date  = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };

    const slots = await MentorSlot.find(filter)
      .populate("mentor", "name avatar role")
      .sort({ date: 1 })
      .limit(50);

    // Group by mentor
    const mentorMap = {};
    slots.forEach((slot) => {
      const mid = slot.mentor._id.toString();
      if (!mentorMap[mid]) {
        mentorMap[mid] = {
          mentor: slot.mentor,
          slots:  [],
        };
      }
      mentorMap[mid].slots.push(slot);
    });

    return successResponse(res, 200, "Mentors fetched", Object.values(mentorMap));
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET MY SLOTS (as mentor) ─────────────────────────────────────────────
// GET /api/mentors/my-slots
const getMySlots = async (req, res) => {
  try {
    const slots = await MentorSlot.find({ mentor: req.user._id })
      .populate("bookedBy", "name avatar email")
      .sort({ date: 1 });
    return successResponse(res, 200, "Slots fetched", slots);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── CREATE SLOT ──────────────────────────────────────────────────────────
// POST /api/mentors/slots
const createSlot = async (req, res) => {
  try {
    // Only senior/admin can create slots
    if (!["senior", "admin"].includes(req.user.role)) {
      return errorResponse(res, 403, "Only seniors and alumni can offer mentorship slots");
    }

    const { date, startTime, endTime, duration, topic, description, meetLink } = req.body;

    if (!date || !startTime || !endTime) {
      return errorResponse(res, 400, "Date, start time and end time are required");
    }

    const slot = await MentorSlot.create({
      mentor: req.user._id,
      date: new Date(date),
      startTime, endTime,
      duration:    duration    || 30,
      topic:       topic       || "Mock Interview",
      description: description || "",
      meetLink:    meetLink    || "",
    });

    await slot.populate("mentor", "name avatar");
    return successResponse(res, 201, "Slot created", slot);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── UPDATE SLOT ──────────────────────────────────────────────────────────
// PUT /api/mentors/slots/:id
const updateSlot = async (req, res) => {
  try {
    const slot = await MentorSlot.findOneAndUpdate(
      { _id: req.params.id, mentor: req.user._id, isBooked: false },
      req.body,
      { new: true }
    );
    if (!slot) return errorResponse(res, 404, "Slot not found or already booked");
    return successResponse(res, 200, "Slot updated", slot);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── DELETE SLOT ──────────────────────────────────────────────────────────
// DELETE /api/mentors/slots/:id
const deleteSlot = async (req, res) => {
  try {
    const slot = await MentorSlot.findOneAndDelete({
      _id: req.params.id,
      mentor: req.user._id,
      isBooked: false,
    });
    if (!slot) return errorResponse(res, 404, "Slot not found or already booked");
    return successResponse(res, 200, "Slot deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── BOOK A SLOT ──────────────────────────────────────────────────────────
// POST /api/mentors/slots/:id/book
const bookSlot = async (req, res) => {
  try {
    const { menteeNote } = req.body;

    const slot = await MentorSlot.findById(req.params.id).populate("mentor", "name");
    if (!slot)          return errorResponse(res, 404, "Slot not found");
    if (slot.isBooked)  return errorResponse(res, 400, "Slot already booked");
    if (slot.mentor._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, "You cannot book your own slot");
    }

    // Mark slot as booked
    slot.isBooked  = true;
    slot.bookedBy  = req.user._id;
    slot.status    = "booked";
    await slot.save();

    // Create booking
    const booking = await Booking.create({
      slot:       slot._id,
      mentor:     slot.mentor._id,
      mentee:     req.user._id,
      menteeNote: menteeNote || "",
    });

    // Notify mentor
    await Notification.create({
      recipient: slot.mentor._id,
      type:      "booking_confirmed",
      title:     "New Mentorship Booking",
      message:   `${req.user.name} booked your ${slot.topic} slot on ${slot.date.toDateString()}`,
      link:      "/my-bookings",
      relatedBooking: booking._id,
    });

    if (req.io) {
      req.io.to(`user:${slot.mentor._id}`).emit("notification:new", {
        type:    "booking_confirmed",
        title:   "New Booking",
        message: `${req.user.name} booked your slot`,
      });
    }

    await booking.populate("mentor", "name avatar");
    await booking.populate("mentee", "name avatar");
    return successResponse(res, 201, "Slot booked successfully!", booking);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── GET MY BOOKINGS (as mentee) ──────────────────────────────────────────
// GET /api/mentors/my-bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ mentee: req.user._id })
      .populate("mentor", "name avatar email")
      .populate("slot",   "date startTime endTime topic meetLink duration")
      .sort({ createdAt: -1 });
    return successResponse(res, 200, "Bookings fetched", bookings);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── CANCEL BOOKING ───────────────────────────────────────────────────────
// PUT /api/mentors/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate("slot")
      .populate("mentor", "name")
      .populate("mentee", "name");

    if (!booking) return errorResponse(res, 404, "Booking not found");

    const isMentor = booking.mentor._id.toString() === req.user._id.toString();
    const isMentee = booking.mentee._id.toString() === req.user._id.toString();

    if (!isMentor && !isMentee) {
      return errorResponse(res, 403, "Not authorized to cancel this booking");
    }

    booking.status      = "cancelled";
    booking.cancelledBy = isMentor ? "mentor" : "mentee";
    booking.cancelReason= reason || "";
    await booking.save();

    // Free up the slot
    await MentorSlot.findByIdAndUpdate(booking.slot._id, {
      isBooked: false, bookedBy: null, status: "available",
    });

    // Notify the other party
    const notifyUser = isMentor ? booking.mentee._id : booking.mentor._id;
    const cancellerName = isMentor ? booking.mentor.name : booking.mentee.name;

    await Notification.create({
      recipient: notifyUser,
      type:      "booking_cancelled",
      title:     "Booking Cancelled",
      message:   `${cancellerName} cancelled the ${booking.slot?.topic} session`,
      link:      "/my-bookings",
      relatedBooking: booking._id,
    });

    return successResponse(res, 200, "Booking cancelled", booking);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── SUBMIT FEEDBACK ──────────────────────────────────────────────────────
// PUT /api/mentors/bookings/:id/feedback
const submitFeedback = async (req, res) => {
  try {
    const { feedback, rating } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return errorResponse(res, 404, "Booking not found");

    const isMentee = booking.mentee.toString() === req.user._id.toString();
    const isMentor = booking.mentor.toString() === req.user._id.toString();

    if (isMentee) {
      booking.menteeFeedback = feedback;
      booking.menteeRating   = rating;
    } else if (isMentor) {
      booking.mentorFeedback = feedback;
    } else {
      return errorResponse(res, 403, "Not authorized");
    }

    booking.status = "completed";
    await booking.save();

    return successResponse(res, 200, "Feedback submitted", booking);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  getMentors, getMySlots, createSlot, updateSlot, deleteSlot,
  bookSlot, getMyBookings, cancelBooking, submitFeedback,
};
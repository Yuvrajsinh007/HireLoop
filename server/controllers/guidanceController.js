const GuidanceRequest  = require("../models/GuidanceRequest");
const MentorshipSession= require("../models/MentorshipSession");
const MemberProfile    = require("../models/MemberProfile");
const Notification     = require("../models/Notification");
const User             = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { tenantFilter }                   = require("../middleware/tenantMiddleware");

// ─── STUDENT: SUBMIT GUIDANCE REQUEST ────────────────────────────────────
// POST /api/guidance
const submitRequest = async (req, res) => {
  try {
    // Only current students can submit requests
    if (!["ENROLLED", "FINAL_YEAR"].includes(req.user.academicStatus)) {
      return errorResponse(res, 403, "Only current students can submit guidance requests");
    }

    const {
      targetCompany, targetCompanyName, targetRole,
      topic, description, preferredSessionType,
    } = req.body;

    if (!description || description.trim().length < 20) {
      return errorResponse(res, 400, "Please describe what you need help with (min 20 characters)");
    }

    const request = await GuidanceRequest.create({
      institution:         req.institutionId,
      requestedBy:         req.user._id,
      targetCompany:       targetCompany  || null,
      targetCompanyName:   targetCompanyName || "",
      targetRole,
      topic:               topic || "Interview Preparation",
      description,
      preferredSessionType: preferredSessionType || "Either",
      status:              "PENDING_REVIEW",
    });

    await request.populate("requestedBy", "name email avatar");
    await request.populate("targetCompany", "name logo");

    // Notify all officers in the institution
    const officers = await User.find({
      institution: req.institutionId,
      role:        { $in: ["officer", "collegeAdmin"] },
      isActive:    true,
    }).select("_id");

    const notifications = officers.map((o) => ({
      recipient:              o._id,
      institution:            req.institutionId,
      type:                   "guidance_request_update",
      title:                  "New Guidance Request",
      message:                `${req.user.name} submitted a guidance request for ${targetCompanyName || "a company"}`,
      link:                   "/officer/guidance",
      relatedGuidanceRequest: request._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    if (req.io) {
      officers.forEach((o) => {
        req.io.to(`user:${o._id}`).emit("notification:new", {
          type:    "guidance_request_update",
          title:   "New Guidance Request",
          message: `${req.user.name} needs guidance for ${targetCompanyName || "a company"}`,
        });
      });
    }

    return successResponse(res, 201, "Guidance request submitted successfully", request);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── STUDENT: GET MY REQUESTS ─────────────────────────────────────────────
// GET /api/guidance/my
const getMyRequests = async (req, res) => {
  try {
    const requests = await GuidanceRequest.find({
      institution: req.institutionId,
      requestedBy: req.user._id,
    })
      .populate("targetCompany", "name logo")
      // NOTE: assignedAlumni NOT populated here — student cannot see alumni details
      .select("-assignedAlumni -officerNotes -alumniContactedAt -alumniDeclineReason")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Your guidance requests fetched", requests);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── STUDENT: GET MY SESSIONS ─────────────────────────────────────────────
// GET /api/guidance/my-sessions
const getMySessions = async (req, res) => {
  try {
    const sessions = await MentorshipSession.find({
      institution: req.institutionId,
      students:    req.user._id,
    })
      .populate("alumni",   "name avatar")   // limited alumni info only
      .populate("createdBy","name")
      .select("-guidanceRequests")
      .sort({ scheduledDate: -1 });

    return successResponse(res, 200, "Your sessions fetched", sessions);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── STUDENT: SUBMIT SESSION FEEDBACK ─────────────────────────────────────
// POST /api/guidance/sessions/:id/feedback
const submitStudentFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const session = await MentorshipSession.findOne({
      _id:         req.params.id,
      institution: req.institutionId,
      students:    req.user._id,
      status:      "COMPLETED",
    });

    if (!session) return errorResponse(res, 404, "Session not found or not completed yet");

    // Check if already submitted
    const alreadySubmitted = session.studentFeedbacks.some(
      (f) => f.student.toString() === req.user._id.toString()
    );
    if (alreadySubmitted) return errorResponse(res, 400, "You have already submitted feedback");

    session.studentFeedbacks.push({
      student:  req.user._id,
      rating:   rating || null,
      feedback: feedback || "",
    });
    await session.save();

    return successResponse(res, 200, "Feedback submitted, thank you!");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── OFFICER: GET ALL REQUESTS ────────────────────────────────────────────
// GET /api/guidance/officer/requests
const getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = tenantFilter(req, {});
    if (status) filter.status = status;

    const [requests, total] = await Promise.all([
      GuidanceRequest.find(filter)
        .populate("requestedBy",  "name email avatar academicStatus")
        .populate("targetCompany","name logo")
        .populate("assignedAlumni", "name email avatar currentCompany currentRole", null,
          // officer CAN see alumni details
        )
        .populate("assignedOfficer", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      GuidanceRequest.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Guidance requests fetched", {
      requests, total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── OFFICER: ASSIGN ALUMNI TO REQUEST ────────────────────────────────────
// PUT /api/guidance/officer/requests/:id/assign-alumni
const assignAlumni = async (req, res) => {
  try {
    const { alumniId, officerNotes } = req.body;
    if (!alumniId) return errorResponse(res, 400, "Alumni ID is required");

    // Verify alumni belongs to same institution and is actually alumni
    const alumni = await User.findOne({
      _id:            alumniId,
      institution:    req.institutionId,
      role:           "member",
      academicStatus: "GRADUATED",
      isActive:       true,
    });

    if (!alumni) return errorResponse(res, 404, "Alumni not found in your institution");

    const request = await GuidanceRequest.findOneAndUpdate(
      tenantFilter(req, { _id: req.params.id }),
      {
        assignedAlumni:    alumniId,
        assignedOfficer:   req.user._id,
        status:            "ALUMNI_CONTACTED",
        officerNotes:      officerNotes || "",
        alumniContactedAt: new Date(),
      },
      { new: true }
    )
      .populate("requestedBy",  "name email")
      .populate("assignedAlumni", "name email avatar");

    if (!request) return errorResponse(res, 404, "Guidance request not found");

    // Notify alumni (via platform notification + email handled separately)
    await Notification.create({
      recipient:              alumni._id,
      institution:            req.institutionId,
      type:                   "alumni_contacted",
      title:                  "Guidance Request",
      message:                `The placement office has a student who needs guidance. Please check your dashboard.`,
      link:                   "/alumni/guidance",
      relatedGuidanceRequest: request._id,
    });

    if (req.io) {
      req.io.to(`user:${alumni._id}`).emit("notification:new", {
        type:    "alumni_contacted",
        title:   "Guidance Request from Placement Office",
        message: "A student needs your guidance. Please respond.",
      });
    }

    return successResponse(res, 200, "Alumni assigned and notified", request);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── OFFICER: UPDATE REQUEST STATUS ───────────────────────────────────────
// PUT /api/guidance/officer/requests/:id/status
const updateRequestStatus = async (req, res) => {
  try {
    const { status, officerNotes, closedReason } = req.body;

    const validStatuses = [
      "PENDING_REVIEW","ALUMNI_CONTACTED","ALUMNI_ACCEPTED",
      "ALUMNI_DECLINED","SESSION_SCHEDULED","COMPLETED","CLOSED",
    ];
    if (!validStatuses.includes(status))
      return errorResponse(res, 400, "Invalid status");

    const update = { status, officerNotes };
    if (status === "CLOSED") {
      update.closedAt     = new Date();
      update.closedReason = closedReason || "";
    }

    const request = await GuidanceRequest.findOneAndUpdate(
      tenantFilter(req, { _id: req.params.id }),
      update,
      { new: true }
    )
      .populate("requestedBy", "name email")
      .populate("assignedAlumni", "name email");

    if (!request) return errorResponse(res, 404, "Request not found");

    // Notify student of status change
    await Notification.create({
      recipient:              request.requestedBy._id,
      institution:            req.institutionId,
      type:                   "guidance_request_update",
      title:                  "Guidance Request Update",
      message:                `Your guidance request status has been updated to: ${status.replace(/_/g, " ")}`,
      link:                   "/guidance/my-requests",
      relatedGuidanceRequest: request._id,
    });

    return successResponse(res, 200, "Request status updated", request);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── OFFICER: CREATE MENTORSHIP SESSION ───────────────────────────────────
// POST /api/guidance/officer/sessions
const createSession = async (req, res) => {
  try {
    const {
      alumniId, studentIds, guidanceRequestIds,
      title, sessionType, description,
      scheduledDate, startTime, endTime, durationMinutes,
      meetLink, meetingPlatform,
    } = req.body;

    if (!alumniId || !studentIds?.length || !title || !scheduledDate)
      return errorResponse(res, 400, "Alumni, students, title, and date are required");

    // Verify alumni is from same institution
    const alumni = await User.findOne({
      _id:            alumniId,
      institution:    req.institutionId,
      academicStatus: "GRADUATED",
    });
    if (!alumni) return errorResponse(res, 404, "Alumni not found in your institution");

    const session = await MentorshipSession.create({
      institution:      req.institutionId,
      createdBy:        req.user._id,
      alumni:           alumniId,
      students:         studentIds,
      guidanceRequests: guidanceRequestIds || [],
      title,
      sessionType:      sessionType || "Mock Interview",
      description:      description || "",
      scheduledDate:    new Date(scheduledDate),
      startTime,
      endTime,
      durationMinutes:  durationMinutes || 60,
      meetLink:         meetLink || "",
      meetingPlatform:  meetingPlatform || "Google Meet",
    });

    // Update linked guidance requests to SESSION_SCHEDULED
    if (guidanceRequestIds?.length) {
      await GuidanceRequest.updateMany(
        { _id: { $in: guidanceRequestIds }, institution: req.institutionId },
        { status: "SESSION_SCHEDULED", session: session._id }
      );
    }

    // Notify students (NOT sharing alumni contact — only meeting link)
    const studentNotifications = studentIds.map((sId) => ({
      recipient:   sId,
      institution: req.institutionId,
      type:        "session_scheduled",
      title:       "Mentorship Session Scheduled!",
      message:     `A ${sessionType || "mentorship"} session has been arranged for you on ${new Date(scheduledDate).toDateString()}.`,
      link:        "/guidance/my-sessions",
      relatedSession: session._id,
    }));

    // Notify alumni
    studentNotifications.push({
      recipient:   alumniId,
      institution: req.institutionId,
      type:        "session_scheduled",
      title:       "Mentorship Session Assigned",
      message:     `You have been assigned a ${sessionType || "mentorship"} session on ${new Date(scheduledDate).toDateString()}.`,
      link:        "/alumni/sessions",
      relatedSession: session._id,
    });

    await Notification.insertMany(studentNotifications);

    // Socket notifications
    if (req.io) {
      [...studentIds, alumniId].forEach((userId) => {
        req.io.to(`user:${userId}`).emit("notification:new", {
          type:    "session_scheduled",
          title:   "New Session Scheduled",
          message: `Session: ${title} on ${new Date(scheduledDate).toDateString()}`,
        });
      });
    }

    await session.populate("alumni",   "name avatar");
    await session.populate("students", "name avatar");
    await session.populate("createdBy","name");

    return successResponse(res, 201, "Session created successfully", session);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── OFFICER: GET ALL SESSIONS ────────────────────────────────────────────
// GET /api/guidance/officer/sessions
const getAllSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = tenantFilter(req, {});
    if (status) filter.status = status;

    const [sessions, total] = await Promise.all([
      MentorshipSession.find(filter)
        .populate("alumni",   "name email avatar currentCompany currentRole")
        .populate("students", "name email avatar")
        .populate("createdBy","name")
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      MentorshipSession.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Sessions fetched", {
      sessions, total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── OFFICER: UPDATE SESSION ──────────────────────────────────────────────
// PUT /api/guidance/officer/sessions/:id
const updateSession = async (req, res) => {
  try {
    const session = await MentorshipSession.findOneAndUpdate(
      tenantFilter(req, { _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    )
      .populate("alumni",   "name avatar")
      .populate("students", "name avatar");

    if (!session) return errorResponse(res, 404, "Session not found");
    return successResponse(res, 200, "Session updated", session);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ALUMNI: GET MY ASSIGNED SESSIONS ────────────────────────────────────
// GET /api/guidance/alumni/sessions
const getAlumniSessions = async (req, res) => {
  try {
    if (req.user.academicStatus !== "GRADUATED")
      return errorResponse(res, 403, "Alumni only");

    const sessions = await MentorshipSession.find({
      institution: req.institutionId,
      alumni:      req.user._id,
    })
      // Alumni sees student names but NOT their private contact details
      .populate("students", "name avatar academicStatus")
      .populate("createdBy","name")
      .sort({ scheduledDate: -1 });

    return successResponse(res, 200, "Your assigned sessions fetched", sessions);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── ALUMNI: SUGGEST RELEVANT ALUMNI FOR A REQUEST ────────────────────────
// GET /api/guidance/officer/requests/:id/suggest-alumni
// Officer uses this to find matching alumni for a request
const suggestAlumni = async (req, res) => {
  try {
    const request = await GuidanceRequest.findOne(
      tenantFilter(req, { _id: req.params.id })
    ).populate("targetCompany", "name");

    if (!request) return errorResponse(res, 404, "Request not found");

    // Find alumni from same institution who are available for mentorship
    const profileFilter = {
      institution:             req.institutionId,
      isAvailableForMentorship: true,
    };

    const availableProfiles = await MemberProfile.find(profileFilter)
      .populate({
        path:  "user",
        match: { academicStatus: "GRADUATED", isActive: true },
        select: "name email avatar academicStatus employmentStatus currentCompany currentRole",
      })
      .select("currentCompany currentRole mentorshipTopics graduationYear program")
      .populate("program", "name");

    // Filter out null users (those who didn't match the populate match condition)
    const alumni = availableProfiles
      .filter((p) => p.user !== null)
      .map((p) => ({
        _id:            p.user._id,
        name:           p.user.name,
        avatar:         p.user.avatar,
        currentCompany: p.currentCompany,
        currentRole:    p.currentRole,
        program:        p.program?.name,
        graduationYear: p.graduationYear,
        mentorshipTopics: p.mentorshipTopics,
        // Relevance score (simple: if current company matches target)
        isRelevant: request.targetCompanyName
          ? p.currentCompany?.toLowerCase().includes(request.targetCompanyName.toLowerCase())
          : false,
      }))
      .sort((a, b) => (b.isRelevant ? 1 : 0) - (a.isRelevant ? 1 : 0));

    return successResponse(res, 200, "Suggested alumni fetched", alumni);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  // Student
  submitRequest, getMyRequests, getMySessions, submitStudentFeedback,
  // Officer
  getAllRequests, assignAlumni, updateRequestStatus,
  createSession, getAllSessions, updateSession, suggestAlumni,
  // Alumni
  getAlumniSessions,
};
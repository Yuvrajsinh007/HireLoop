const crypto = require("crypto");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");
// Assuming you have a generic sendEmail utility or Brevo template for this
// const { sendStaffInviteEmail } = require("../utils/sendEmail"); 

// ─── INVITE STAFF (College Admin Only) ────────────────────────────────────
// POST /api/invitations/staff
const inviteStaff = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return errorResponse(res, 400, "Name, email, and role are required");
    }

    if (!["officer", "collegeAdmin"].includes(role)) {
      return errorResponse(res, 400, "Invalid role. Must be officer or collegeAdmin");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "A user with this email is already registered");
    }

    // Generate a secure, random temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex");

    // Create the staff user securely scoped to the current institution
    const staffUser = await User.create({
      name,
      email,
      password: tempPassword,
      role,
      institution: req.institutionId,
      academicStatus: "NOT_APPLICABLE",
      placementStatus: "NOT_APPLICABLE",
      employmentStatus: "NOT_APPLICABLE",
      isEmailVerified: true, // Pre-verified since the admin is inviting them directly
    });

    // NOTE: Integrate your Brevo email template here to email the user their credentials
    // try {
    //   await sendStaffInviteEmail({ to: email, name, role, tempPassword });
    // } catch (emailErr) {
    //   console.error("Failed to send invite email", emailErr);
    // }

    // Returning the temp password in the response for ease of development/testing.
    // In production, you might only email this and not send it in the JSON response.
    return successResponse(res, 201, "Staff member invited successfully", {
      user: {
        _id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        isActive: staffUser.isActive
      },
      temporaryPassword: tempPassword 
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = {
  inviteStaff,
};
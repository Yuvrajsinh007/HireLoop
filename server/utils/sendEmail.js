// sendEmail.js

const nodemailer = require("nodemailer");
const { brevo, defaultSender } = require("../config/brevo");

const welcomeEmailTemplate       = require("../templates/welcomeEmail");
const verificationOtpTemplate    = require("../templates/verificationEmail");
const loginOtpTemplate           = require("../templates/loginOtpEmail");
const passwordResetOtpTemplate   = require("../templates/passwordResetEmail");
const placementAlertTemplate     = require("../templates/placementAlertEmail");
const staffInviteEmailTemplate   = require("../templates/staffInviteEmail"); // <-- Added
const suspensionEmailTemplate = require("../templates/suspensionEmail");
const reactivationEmailTemplate = require("../templates/reactivationEmail");

// ─── SMTP Fallback ─────────────────────────────────────────────────────────
const sendViaSMTP = async (toEmail, name, subject, html) => {
  const SMTP_USER = process.env.EMAIL_USER;
  const SMTP_PASS = process.env.EMAIL_PASS;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP credentials not configured for fallback.");
  }

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || "smtp-relay.brevo.com",
    port:   process.env.SMTP_PORT   ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });

  const info = await transporter.sendMail({
    from:    `${defaultSender.name} <${defaultSender.email}>`,
    to:      name ? `${name} <${toEmail}>` : toEmail,
    subject,
    html,
    text: "Please enable HTML to view this email.",
  });

  return { success: true, messageId: info.messageId };
};

// ─── Core sendEmail ────────────────────────────────────────────────────────
const sendEmail = async ({ to, name, subject, html }) => {
  try {
    if (!brevo) {
      console.warn("BREVO_API_KEY not set — attempting SMTP fallback");
      return await sendViaSMTP(to, name, subject, html);
    }

    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender:      defaultSender,
      to:          [{ email: to, name: name || to }],
      subject,
      htmlContent: html,
    });

    return result;
  } catch (error) {
    console.error(`Brevo send failed to ${to}:`, error.message);
    return await sendViaSMTP(to, name, subject, html);
  }
};

// ─── Email Functions ───────────────────────────────────────────────────────

const sendWelcomeEmail = async ({ to, name }) => {
  await sendEmail({
    to, name,
    subject: "Welcome to HireLoop 🎉",
    html: welcomeEmailTemplate(name, process.env.CLIENT_URL),
  });
};

/** Email Verification OTP */
const sendVerificationOtpEmail = async ({ to, name, otp }) => {
  await sendEmail({
    to, name,
    subject: "HireLoop — Your Email Verification Code",
    html: verificationOtpTemplate(name, otp),
  });
};

/** Login OTP */
const sendLoginOtpEmail = async ({ to, name, otp }) => {
  await sendEmail({
    to, name,
    subject: "HireLoop — Your Login Code",
    html: loginOtpTemplate(name, otp),
  });
};

/** Password Reset OTP */
const sendPasswordResetOtpEmail = async ({ to, name, otp }) => {
  await sendEmail({
    to, name,
    subject: "HireLoop — Password Reset Code",
    html: passwordResetOtpTemplate(name, otp),
  });
};

/** Placement Alert */
const sendPlacementAlertEmail = async ({ to, name, companyName, driveDate }) => {
  await sendEmail({
    to, name,
    subject: `HireLoop — ${companyName} is visiting campus! 🏢`,
    html: placementAlertTemplate(name, companyName, driveDate, process.env.CLIENT_URL),
  });
};

/** Staff Invitation Email */
const sendStaffInviteEmail = async ({ to, name, role, tempPassword }) => {
  await sendEmail({
    to, name,
    subject: "You've been invited to join HireLoop",
    html: staffInviteEmailTemplate(name, role, to, tempPassword, `${process.env.CLIENT_URL}/login`),
  });
};

/** Institution Suspension Alert */
const sendSuspensionEmail = async ({ to, name, institutionName, reason }) => {
  await sendEmail({
    to, name,
    subject: "Urgent: Your HireLoop Institution Account has been Suspended",
    html: suspensionEmailTemplate(name, institutionName, reason),
  });
};

/** Institution Reactivation Alert */
const sendReactivationEmail = async ({ to, name, institutionName }) => {
  await sendEmail({
    to, name,
    subject: "Resolved: Your HireLoop Institution Account has been Reactivated",
    html: reactivationEmailTemplate(name, institutionName, `${process.env.CLIENT_URL}/login`),
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationOtpEmail,
  sendLoginOtpEmail,
  sendPasswordResetOtpEmail,
  sendPlacementAlertEmail,
  sendStaffInviteEmail,
  sendSuspensionEmail,
  sendReactivationEmail,
};
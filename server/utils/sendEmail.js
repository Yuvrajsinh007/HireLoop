const nodemailer = require("nodemailer");
const { brevo, defaultSender } = require("../config/brevo");

// Import your newly created templates
const welcomeEmailTemplate = require("../templates/welcomeEmail");
const passwordResetTemplate = require("../templates/passwordResetEmail");
const verificationTemplate = require("../templates/verificationEmail");
const placementAlertTemplate = require("../templates/placementAlertEmail");

// Fallback to SMTP using nodemailer
const sendViaSMTP = async (toEmail, name, subject, html, text) => {
  const SMTP_USER = process.env.EMAIL_USER;
  const SMTP_PASS = process.env.EMAIL_PASS;
  
  if (!SMTP_USER || !SMTP_PASS) {
    console.error("❌ SMTP credentials not configured for fallback.");
    throw new Error("All email sending methods failed");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    const info = await transporter.sendMail({
      from: `${defaultSender.name} <${defaultSender.email}>`,
      to: name ? `${name} <${toEmail}>` : toEmail,
      subject,
      text: text || "Please enable HTML to view this email.",
      html: html,
    });
    console.log(`✅ Email sent via SMTP fallback to ${toEmail} | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ SMTP fallback failed:", error.message || error);
    throw new Error("Email could not be sent via API or SMTP");
  }
};

/**
 * Send a transactional email via Brevo with SMTP fallback
 */
const sendEmail = async ({ to, name, subject, html, text }) => {
  try {
    if (!brevo) {
      console.warn("⚠️ BREVO_API_KEY not set — attempting SMTP fallback");
      return await sendViaSMTP(to, name, subject, html, text);
    }

    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: defaultSender,
      to: [{ email: to, name: name || to }],
      subject: subject,
      htmlContent: html,
      textContent: text
    });

    console.log(`✅ Email sent via Brevo API to ${to} | MessageId: ${result.messageId}`);
    return result;
    
  } catch (error) {
    console.error(`⚠️ Brevo API send failed to ${to}:`, error.message);
    console.log("🔄 Attempting SMTP fallback...");
    
    return await sendViaSMTP(to, name, subject, html, text);
  }
};

// ─── Pre-built Email Functions ─────────────────────────────────────────────

const sendWelcomeEmail = async ({ to, name }) => {
  await sendEmail({
    to,
    name,
    subject: "Welcome to HireLoop 🎉",
    html: welcomeEmailTemplate(name, process.env.CLIENT_URL),
  });
};

const sendPasswordResetEmail = async ({ to, name, resetURL }) => {
  await sendEmail({
    to,
    name,
    subject: "HireLoop — Password Reset Request",
    html: passwordResetTemplate(name, resetURL),
  });
};

const sendVerificationEmail = async ({ to, name, verifyURL }) => {
  await sendEmail({
    to,
    name,
    subject: "HireLoop — Verify Your Email",
    html: verificationTemplate(name, verifyURL),
  });
};

const sendPlacementAlertEmail = async ({ to, name, companyName, driveDate }) => {
  await sendEmail({
    to,
    name,
    subject: `HireLoop — ${companyName} is visiting campus! 🏢`,
    html: placementAlertTemplate(name, companyName, driveDate, process.env.CLIENT_URL),
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendPlacementAlertEmail,
};
const nodemailer = require("nodemailer");
const { brevo, defaultSender } = require("../config/brevo");

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
    // If API key is missing or client wasn't initialized, skip to SMTP
    if (!brevo) {
      console.warn("⚠️ BREVO_API_KEY not set — attempting SMTP fallback");
      return await sendViaSMTP(to, name, subject, html, text);
    }

    // New v5 syntax for sending emails
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
    
    // Fallback if the primary API approach fails
    return await sendViaSMTP(to, name, subject, html, text);
  }
};

// ─── Pre-built Email Templates ─────────────────────────────────────────────

const sendWelcomeEmail = async ({ to, name }) => {
  await sendEmail({
    to,
    name,
    subject: "Welcome to HireLoop 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to HireLoop, ${name}! 🚀</h2>
        <p>We're excited to have you on board.</p>
        <p>HireLoop is your campus placement intelligence platform — track your journey, read senior experiences, and land your dream job.</p>
        <a href="${process.env.CLIENT_URL}" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">
          Get Started
        </a>
        <p style="margin-top: 20px; color: #888;">— Team HireLoop</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async ({ to, name, resetURL }) => {
  await sendEmail({
    to,
    name,
    subject: "HireLoop — Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Password Reset</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetURL}" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">
          Reset Password
        </a>
        <p style="margin-top: 20px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #888;">— Team HireLoop</p>
      </div>
    `,
  });
};

const sendVerificationEmail = async ({ to, name, verifyURL }) => {
  await sendEmail({
    to,
    name,
    subject: "HireLoop — Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Verify Your Email</h2>
        <p>Hi ${name},</p>
        <p>Please verify your college email to activate your HireLoop account.</p>
        <a href="${verifyURL}" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">
          Verify Email
        </a>
        <p style="margin-top: 20px; color: #888;">— Team HireLoop</p>
      </div>
    `,
  });
};

const sendPlacementAlertEmail = async ({ to, name, companyName, driveDate }) => {
  await sendEmail({
    to,
    name,
    subject: `HireLoop — ${companyName} is visiting campus! 🏢`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #4F46E5;">New Campus Drive Alert 🎯</h2>
        <p>Hi ${name},</p>
        <p><strong>${companyName}</strong> is visiting your campus on <strong>${driveDate}</strong>.</p>
        <p>Log in to HireLoop to check eligibility criteria, past interview experiences, and track your application.</p>
        <a href="${process.env.CLIENT_URL}/companies" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">
          View Company Details
        </a>
        <p style="margin-top: 20px; color: #888;">— Team HireLoop</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendPlacementAlertEmail,
};
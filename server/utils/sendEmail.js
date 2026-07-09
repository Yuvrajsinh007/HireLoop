const { apiInstance, defaultSender, SibApiV3Sdk } = require("../config/brevo");

/**
 * Send a transactional email via Brevo
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} options.text - Plain text body (optional)
 */
const sendEmail = async ({ to, name, subject, html, text }) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = defaultSender;
    sendSmtpEmail.to = [{ email: to, name: name || to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    if (text) {
      sendSmtpEmail.textContent = text;
    }

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to} | MessageId: ${result.body?.messageId}`);
    return result;
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    throw new Error("Email could not be sent");
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
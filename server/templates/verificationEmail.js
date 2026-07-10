const verificationTemplate = (name, verifyURL) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <h2 style="color: #4F46E5;">Verify Your Email</h2>
    <p>Hi ${name},</p>
    <p>Please verify your college email to activate your HireLoop account.</p>
    <a href="${verifyURL}" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">
      Verify Email
    </a>
    <p style="margin-top: 20px; color: #888;">— Team HireLoop</p>
  </div>
`;

module.exports = verificationTemplate;
const passwordResetTemplate = (name, resetURL) => `
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
`;

module.exports = passwordResetTemplate;
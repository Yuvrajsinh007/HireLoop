const loginOtpTemplate = (name, otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; background: #f9fafb; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background: #4F46E5; color: white; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 10px;">HireLoop</div>
    </div>
    <div style="background: white; border-radius: 10px; padding: 32px; border: 1px solid #e5e7eb;">
      <h2 style="color: #111827; margin-top: 0;">Your Login OTP</h2>
      <p style="color: #6b7280;">Hi <strong style="color: #111827;">${name}</strong>,</p>
      <p style="color: #6b7280;">Use the OTP below to log into HireLoop. Valid for <strong>10 minutes</strong>.</p>
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: #F0FDF4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px 40px;">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #16a34a; font-weight: 600; margin-bottom: 8px;">Login Code</p>
          <p style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #15803d;">${otp}</p>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>.</p>
      <p style="color: #ef4444; font-size: 13px; font-weight: 600;">⚠️ Security Notice: If you did not request this login OTP, someone may be trying to access your account. Please ignore this email and consider changing your password.</p>
    </div>
    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">— Team HireLoop</p>
  </div>
`;
module.exports = loginOtpTemplate;
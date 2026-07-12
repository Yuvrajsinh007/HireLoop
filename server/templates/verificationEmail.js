const verificationOtpTemplate = (name, otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; background: #f9fafb; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background: #4F46E5; color: white; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 10px;">HireLoop</div>
    </div>
    <div style="background: white; border-radius: 10px; padding: 32px; border: 1px solid #e5e7eb;">
      <h2 style="color: #111827; margin-top: 0;">Verify Your Email Address</h2>
      <p style="color: #6b7280;">Hi <strong style="color: #111827;">${name}</strong>,</p>
      <p style="color: #6b7280;">Use the OTP below to verify your HireLoop email. Valid for <strong>10 minutes</strong>.</p>
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: #EEF2FF; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px 40px;">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; font-weight: 600; margin-bottom: 8px;">Verification Code</p>
          <p style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #4F46E5;">${otp}</p>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>.</p>
      <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email.</p>
    </div>
    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">— Team HireLoop</p>
  </div>
`;
module.exports = verificationOtpTemplate;
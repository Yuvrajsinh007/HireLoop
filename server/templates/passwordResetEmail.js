// passwordResetEmail.js
const passwordResetOtpTemplate = (name, otp) => `
  <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <div style="padding: 40px 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="color: #4F46E5; font-size: 24px; font-weight: 800; letter-spacing: 1px;">HireLoop</span>
        </div>
        
        <h2 style="color: #111827; font-size: 22px; margin-top: 0; text-align: center;">Reset Your Password</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
          Hi <strong style="color: #111827;">${name}</strong>,<br>
          We received a request to reset your password. Use the code below to proceed.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <div style="display: inline-block; background-color: #FFF7ED; border: 2px dashed #fb923c; border-radius: 8px; padding: 24px 48px;">
            <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #ea580c; font-weight: 700; margin-bottom: 12px;">Reset Code</p>
            <p style="margin: 0; font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #9a3412;">${otp}</p>
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 16px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <div style="background-color: #FEF2F2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px;">
          <p style="color: #991b1b; font-size: 13px; margin: 0; line-height: 1.5;">
            <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email. Your account remains secure.
          </p>
        </div>
      </div>

      <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">— Team HireLoop</p>
      </div>
    </div>
  </div>
`;

module.exports = passwordResetOtpTemplate;
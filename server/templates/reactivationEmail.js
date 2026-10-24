const reactivationEmailTemplate = (name, institutionName, loginUrl) => `
  <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background-color: #10b981; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">Account Reactivated</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px 32px;">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0; margin-bottom: 16px;">Platform Access Restored</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hi <strong style="color: #111827;">${name}</strong>,<br><br>
          Good news! The suspension on the HireLoop workspace for <strong>${institutionName}</strong> has been lifted. Your institution's account is now fully active.
        </p>
        
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
          You, your placement officers, and your students can now log in and resume using all platform features immediately.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${loginUrl}" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Sign In to Dashboard
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">— Team HireLoop</p>
      </div>
    </div>
  </div>
`;

module.exports = reactivationEmailTemplate;
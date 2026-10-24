const suspensionEmailTemplate = (name, institutionName, reason) => `
  <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background-color: #e11d48; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">Action Required: Account Suspended</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px 32px;">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0; margin-bottom: 16px;">Notice of Platform Suspension</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hi <strong style="color: #111827;">${name}</strong>,<br><br>
          This is an official notice that the HireLoop workspace for <strong>${institutionName}</strong> has been suspended by the platform administrators.
        </p>
        
        <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="color: #9f1239; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong>Reason for suspension:</strong><br>
            ${reason}
          </p>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 0;">
          During this suspension, your staff and students will be unable to access the platform. If you believe this is an error or wish to resolve the issue, please contact our support team immediately.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">— Team HireLoop</p>
      </div>
    </div>
  </div>
`;

module.exports = suspensionEmailTemplate;
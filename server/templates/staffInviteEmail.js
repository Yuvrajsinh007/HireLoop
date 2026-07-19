const staffInviteEmailTemplate = (name, role, email, tempPassword, loginUrl) => {
    const roleName = role === "collegeAdmin" ? "College Admin" : "Placement Officer";
    
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to HireLoop!</h1>
        </div>
        <div style="padding: 30px; color: #374151;">
          <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5;">You have been securely invited to join your institution's HireLoop platform as a <strong>${roleName}</strong>.</p>
          
          <div style="background-color: #f3f4f6; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Your Temporary Credentials</p>
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0; font-size: 16px;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 18px; color: #4f46e5; background-color: #e0e7ff; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
          </div>
  
          <p style="font-size: 16px; line-height: 1.5;">For security reasons, please log in and change your password immediately.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${loginUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">Sign In to Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an automated message from the HireLoop Platform.</p>
        </div>
      </div>
    `;
  };
  
  module.exports = staffInviteEmailTemplate;
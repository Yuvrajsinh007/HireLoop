const placementAlertTemplate = (name, companyName, driveDate, clientUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <h2 style="color: #4F46E5;">New Campus Drive Alert 🎯</h2>
    <p>Hi ${name},</p>
    <p><strong>${companyName}</strong> is visiting your campus on <strong>${driveDate}</strong>.</p>
    <p>Log in to HireLoop to check eligibility criteria, past interview experiences, and track your application.</p>
    <a href="${clientUrl}/companies" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">
      View Company Details
    </a>
    <p style="margin-top: 20px; color: #888;">— Team HireLoop</p>
  </div>
`;

module.exports = placementAlertTemplate;
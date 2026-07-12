const welcomeEmailTemplate = (name, clientUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <h2 style="color: #4F46E5;">Welcome to HireLoop, ${name}! 🚀</h2>
    <p>We're excited to have you on board.</p>
    <p>HireLoop is your campus placement intelligence platform — track your journey, read senior experiences, and land your dream job.</p>
    <p style="margin-top: 20px; color: #888;">— Team HireLoop</p>
  </div>
`;

module.exports = welcomeEmailTemplate;
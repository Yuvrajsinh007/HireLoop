// welcomeEmail.js
const welcomeEmailTemplate = (name, clientUrl) => `
  <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background-color: #4F46E5; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">HireLoop</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px 32px;">
        <h2 style="color: #111827; font-size: 22px; margin-top: 0; margin-bottom: 16px;">Welcome to the loop, ${name}! 🚀</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          We're thrilled to have you on board. HireLoop is your ultimate campus placement intelligence platform. Here, you can track your application journey, read exclusive interview experiences from seniors, and prepare to land your dream job.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${clientUrl}" style="background-color: #4F46E5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Go to Your Dashboard
          </a>
        </div>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
          Let's get you placed.<br>
          <strong style="color: #111827;">— Team HireLoop</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          © ${new Date().getFullYear()} HireLoop. All rights reserved.
        </p>
      </div>
    </div>
  </div>
`;

module.exports = welcomeEmailTemplate;
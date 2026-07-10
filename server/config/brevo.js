const { BrevoClient } = require("@getbrevo/brevo");

// Initialize Brevo Client (only if API key exists in .env)
const brevo = process.env.BREVO_API_KEY 
  ? new BrevoClient({ apiKey: process.env.BREVO_API_KEY }) 
  : null;

const defaultSender = {
  name: process.env.BREVO_SENDER_NAME || "HireLoop",
  email: process.env.BREVO_SENDER_EMAIL,
};

module.exports = { brevo, defaultSender };
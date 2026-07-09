const SibApiV3Sdk = require("@getbrevo/brevo");

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const defaultSender = {
  name: process.env.BREVO_SENDER_NAME || "HireLoop",
  email: process.env.BREVO_SENDER_EMAIL,
};

module.exports = { apiInstance, defaultSender, SibApiV3Sdk };
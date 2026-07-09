const jwt = require("jsonwebtoken");

/**
 * Generate a JWT access token
 * @param {string} id - User's MongoDB _id
 * @param {string} role - User's role
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Generate a short-lived token for email verification / password reset
 * @param {string} id - User's MongoDB _id
 * @param {string} purpose - 'verify' or 'reset'
 * @returns {string} JWT token (expires in 15 mins)
 */
const generateShortToken = (id, purpose) => {
  return jwt.sign({ id, purpose }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

/**
 * Verify any JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, generateShortToken, verifyToken };
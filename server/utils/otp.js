const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const generateOtp = () => crypto.randomInt(100000, 999999).toString();
const hashOtp = async (otp) => bcrypt.hash(otp, 10);
const compareOtp = async (otp, hash) => bcrypt.compare(otp, hash);
const isOnCooldown = (last) =>
  last && (Date.now() - new Date(last).getTime()) / 1000 < 60;
const cooldownLeft = (last) =>
  Math.max(0, Math.ceil(60 - (Date.now() - new Date(last).getTime()) / 1000));
const getDomain = (email) => email?.split("@")[1]?.toLowerCase().trim();

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  isOnCooldown,
  cooldownLeft,
  getDomain,
};

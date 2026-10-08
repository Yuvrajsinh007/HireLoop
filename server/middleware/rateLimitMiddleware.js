const { errorResponse } = require("../utils/apiResponse");

const buckets = new Map();

const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 20, message } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return errorResponse(
        res,
        429,
        message || "Too many requests. Please try again later."
      );
    }

    entry.count += 1;
    return next();
  };
};

module.exports = { rateLimit };

const { verifyToken } = require("../utils/generateToken");
const User = require("../models/User");
const { errorResponse } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, 401, "Not authorized, no token provided");
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from DB (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return errorResponse(res, 401, "User not found, token invalid");
    }

    if (!user.isActive) {
      return errorResponse(res, 401, "Your account has been deactivated");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, "Not authorized, token failed");
  }
};

module.exports = { protect };
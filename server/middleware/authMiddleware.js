const { verifyToken } = require("../utils/generateToken");
const User = require("../models/User");
const { errorResponse } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, 401, "Not authorized, no token provided");
    }

    const decoded = verifyToken(token);

    // Populate institution so tenant middleware can use it
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("institution", "_id name status isActive");

    if (!user) {
      return errorResponse(res, 401, "User not found, token invalid");
    }

    if (!user.isActive) {
      return errorResponse(res, 401, "Your account has been deactivated");
    }

    // Block access if institution is suspended (except superAdmin)
    if (
      user.role !== "superAdmin" &&
      user.institution &&
      user.institution.status !== "active"
    ) {
      return errorResponse(
        res,
        403,
        "Your institution is not active on this platform. Please contact support."
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, "Not authorized, token failed");
  }
};

module.exports = { protect };
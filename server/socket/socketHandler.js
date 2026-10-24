const { verifyToken } = require("../utils/generateToken");

// Map to store userId → socketId
const userSocketMap = new Map();

const socketHandler = (io) => {
  // ─── Auth middleware for socket ──────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error: No token"));

      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {

    // Store user's socket
    userSocketMap.set(socket.userId, socket.id);

    // Join a personal room (for targeted notifications)
    socket.join(`user:${socket.userId}`);

    // ─── Join company room (for company-specific updates) ──────────────
    socket.on("join:company", (companyId) => {
      socket.join(`company:${companyId}`);
    });

    socket.on("leave:company", (companyId) => {
      socket.leave(`company:${companyId}`);
    });

    // ─── Notification read ─────────────────────────────────────────────
    socket.on("notification:read", (notificationId) => {
    });

    // ─── Disconnect ────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      userSocketMap.delete(socket.userId);
    });
  });
};

/**
 * Send a real-time notification to a specific user
 * @param {Object} io - Socket.io instance
 * @param {string} userId - Target user's MongoDB _id
 * @param {Object} notification - Notification payload
 */
const sendNotificationToUser = (io, userId, notification) => {
  io.to(`user:${userId}`).emit("notification:new", notification);
};

/**
 * Broadcast to all users in a company room
 * @param {Object} io - Socket.io instance
 * @param {string} companyId - Company MongoDB _id
 * @param {string} event - Event name
 * @param {Object} data - Payload
 */
const broadcastToCompany = (io, companyId, event, data) => {
  io.to(`company:${companyId}`).emit(event, data);
};

module.exports = { socketHandler, sendNotificationToUser, broadcastToCompany, userSocketMap };
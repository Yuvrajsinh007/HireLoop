const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

const connectDB = require("./config/db");
const { socketHandler } = require("./socket/socketHandler");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ─── Route Imports ─────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const officerRoutes = require("./routes/officerRoutes");

// ─── Connect to MongoDB ────────────────────────────────────────────────────
connectDB();

// ─── Initialize Express ────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

// ─── Initialize Socket.io ──────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible anywhere via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── Socket Handler ────────────────────────────────────────────────────────
socketHandler(io);

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HireLoop API is running 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/officer", officerRoutes);

// ─── Error Middleware (must be last) ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 HireLoop Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io ready\n`);
});
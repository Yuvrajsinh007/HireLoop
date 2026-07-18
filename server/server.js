const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const dotenv   = require("dotenv");

dotenv.config();

const connectDB        = require("./config/db");
const { socketHandler }= require("./socket/socketHandler");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ─── Route Imports ─────────────────────────────────────────────────────────
const authRoutes        = require("./routes/authRoutes");
const memberRoutes      = require("./routes/memberRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const companyRoutes     = require("./routes/companyRoutes");
const driveRoutes       = require("./routes/driveRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const experienceRoutes  = require("./routes/experienceRoutes");
const guidanceRoutes    = require("./routes/guidanceRoutes");
const officerRoutes     = require("./routes/officerRoutes");
const superAdminRoutes  = require("./routes/superAdminRoutes");

// ─── Connect DB ────────────────────────────────────────────────────────────
connectDB();

// ─── App ───────────────────────────────────────────────────────────────────
const app        = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin:      process.env.CLIENT_URL || "http://localhost:5173",
    methods:     ["GET","POST"],
    credentials: true,
  },
});

app.use((req, res, next) => { req.io = io; next(); });
socketHandler(io);

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success:     true,
    message:     "HireLoop API is running 🚀",
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/members",     memberRoutes);
app.use("/api/institutions",institutionRoutes);
app.use("/api/companies",   companyRoutes);
app.use("/api/drives",      driveRoutes);
app.use("/api/applications",applicationRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/guidance",    guidanceRoutes);
app.use("/api/officer",     officerRoutes);
app.use("/api/super-admin", superAdminRoutes);

// ─── Error Middleware ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 HireLoop Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io ready\n`);
});
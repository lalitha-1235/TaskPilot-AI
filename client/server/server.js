// Load environment variables FIRST — before any other imports that may read process.env
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./database/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const teamRoutes = require("./routes/teamRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const fileRoutes = require("./routes/fileRoutes");
const teamInvitationRoutes = require("./routes/teamInvitationRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();

const app = express();

// Ensure uploads folder exists automatically if it doesn't
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Standard middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Limit request body size to prevent DoS

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", commentRoutes); // Mount comments router on /api/tasks path
app.use("/api/notifications", notificationRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/team-invitations", teamInvitationRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("TaskPilot AI Backend Running");
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Requested API endpoint not found",
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});
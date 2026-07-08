const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./database/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const teamRoutes = require("./routes/teamRoutes");

dotenv.config();
console.log("PORT =", process.env.PORT);
console.log("MONGODB_URI =", process.env.MONGODB_URI);

connectDB();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);

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
  console.log(`Server running on port ${PORT}`);
});
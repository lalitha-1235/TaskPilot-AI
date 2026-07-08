const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getAllUsers,
  getAllTasks,
  getAllTeams,
  deleteUser,
  deleteTask,
  deleteTeam,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const adminOnly = require("../middleware/adminMiddleware");

// All routes in this file are protected by JWT authentication AND restrict to Admins only
router.use(protect);
router.use(adminOnly);

// GET Admin Dashboard stats
router.get("/dashboard", getAdminDashboard);

// GET Users, Tasks, and Teams
router.get("/users", getAllUsers);
router.get("/tasks", getAllTasks);
router.get("/teams", getAllTeams);

// DELETE operations
router.delete("/users/:id", deleteUser);
router.delete("/tasks/:id", deleteTask);
router.delete("/teams/:id", deleteTeam);

module.exports = router;

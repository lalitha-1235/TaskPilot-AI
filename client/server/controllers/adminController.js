const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const Team = require("../models/Team");
const Notification = require("../models/Notification");
const File = require("../models/File");
const TeamInvitation = require("../models/TeamInvitation");
const { logActivity } = require("../utils/activityLogger");

// @desc    Get administrative dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
exports.getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTasks,
      totalTeams,
      totalNotifications,
      totalFiles,
      totalInvitations,
    ] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Team.countDocuments(),
      Notification.countDocuments(),
      File.countDocuments(),
      TeamInvitation.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTasks,
        totalTeams,
        totalNotifications,
        totalUploadedFiles: totalFiles,
        totalInvitations,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    // Validate page
    if (req.query.page !== undefined && (isNaN(page) || page <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Page number must be a positive integer",
      });
    }

    // Validate limit
    if (req.query.limit !== undefined && (isNaN(limit) || limit <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive integer",
      });
    }

    page = page || 1;
    limit = limit || 20;
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments(),
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get all tasks
// @route   GET /api/admin/tasks
// @access  Private (Admin Only)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get all teams
// @route   GET /api/admin/teams
// @access  Private (Admin Only)
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .sort({ createdAt: -1 })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Prevent deleting yourself
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Action Denied: You cannot delete your own administrator account",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    // Log activity
    logActivity(
      req.user._id,
      "User Deleted",
      "System",
      user._id,
      `User ${user.name} (${user.email}) deleted by administrator`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' has been successfully deleted`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/admin/tasks/:id
// @access  Private (Admin Only)
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await Task.findByIdAndDelete(id);

    // Log activity
    logActivity(
      req.user._id,
      "Task Deleted",
      "Task",
      task._id,
      `Task '${task.title}' deleted by administrator`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully by administrator",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Delete a team
// @route   DELETE /api/admin/teams/:id
// @access  Private (Admin Only)
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format",
      });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    await Team.findByIdAndDelete(id);

    // Log activity
    logActivity(
      req.user._id,
      "Team Deleted",
      "Team",
      team._id,
      `Team '${team.name}' deleted by administrator`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully by administrator",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

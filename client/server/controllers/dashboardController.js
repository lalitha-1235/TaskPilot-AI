const Task = require("../models/Task");
const Team = require("../models/Team");

// @desc    Get dashboard metrics and data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Run queries in parallel for efficiency
    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      recentTasks,
      totalTeams,
      recentTeams,
      upcomingDeadlines,
    ] = await Promise.all([
      // 1. Total tasks created by user
      Task.countDocuments({ createdBy: userId }),
      // 2. Todo tasks
      Task.countDocuments({ createdBy: userId, status: "Todo" }),
      // 3. In Progress tasks
      Task.countDocuments({ createdBy: userId, status: "In Progress" }),
      // 4. Completed tasks
      Task.countDocuments({ createdBy: userId, status: "Completed" }),
      // 5. Overdue tasks (not completed and due date in the past)
      Task.countDocuments({
        createdBy: userId,
        status: { $ne: "Completed" },
        dueDate: { $ne: null, $lt: now },
      }),
      // 6. Latest 5 tasks created by the user
      Task.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("assignedTo", "name email avatar role"),
      // 7. Total teams the user belongs to (owner or member)
      Team.countDocuments({
        $or: [{ owner: userId }, { "members.user": userId }],
      }),
      // 8. Latest 5 teams the user belongs to
      Team.find({
        $or: [{ owner: userId }, { "members.user": userId }],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("owner", "name email avatar"),
      // 9. Upcoming deadlines (not completed, due date is today or in future)
      Task.find({
        createdBy: userId,
        status: { $ne: "Completed" },
        dueDate: { $ne: null, $gte: now },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate("assignedTo", "name email avatar role"),
    ]);

    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
      },
      teams: {
        totalTeams,
      },
      recentTasks,
      upcomingDeadlines,
      recentTeams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

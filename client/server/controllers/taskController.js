const mongoose = require("mongoose");
const Task = require("../models/Task");
const { logActivity } = require("../utils/activityLogger");

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, category, assignedTo } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Please provide a task title",
      });
    }

    // Validate assignedTo if it is provided
    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignedTo user ID format",
      });
    }

    const task = await Task.create({
      title,
      description,
      status: status || "Todo",
      priority: priority || "Medium",
      dueDate: dueDate || null,
      category: category || "General",
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    // Log activity
    logActivity(
      req.user._id,
      "Task Created",
      "Task",
      task._id,
      `Task created: ${task.title}`,
      req.ip,
      req.headers["user-agent"]
    );

    if (task.assignedTo) {
      logActivity(
        req.user._id,
        "Task Assigned",
        "Task",
        task._id,
        `Task assigned to user ID: ${task.assignedTo}`,
        req.ip,
        req.headers["user-agent"]
      );
    }

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
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
    limit = limit || 10;
    const skip = (page - 1) * limit;

    // Build query object
    const query = { createdBy: req.user._id };

    // Search functionality (case-insensitive regex search in title and description)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filters (status, priority, category)
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Sorting (default to descending createdAt)
    let sortBy = "-createdAt";
    if (req.query.sort) {
      // Replace commas with spaces if multiple sort fields are provided
      sortBy = req.query.sort.split(",").join(" ");
    }

    // Run count and find queries in parallel for efficiency
    const [total, tasks] = await Promise.all([
      Task.countDocuments(query),
      Task.find(query)
        .populate("assignedTo", "name email avatar role")
        .populate("createdBy", "name email avatar role")
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page,
      pages,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await Task.findById(id)
      .populate("assignedTo", "name email avatar role")
      .populate("createdBy", "name email avatar role");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Authorization check: Must be the creator of the task
    if (task.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view this task",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, category, assignedTo } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    // Validate assignedTo if it is provided
    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignedTo user ID format",
      });
    }

    let task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Authorization check: Must be the creator of the task
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to update this task",
      });
    }

    // Update fields
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (category !== undefined) updates.category = category;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;

    task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email avatar role")
      .populate("createdBy", "name email avatar role");

    // Log activity
    logActivity(
      req.user._id,
      "Task Updated",
      "Task",
      task._id,
      `Task updated: ${task.title}`,
      req.ip,
      req.headers["user-agent"]
    );

    if (status !== undefined) {
      logActivity(
        req.user._id,
        "Task Status Changed",
        "Task",
        task._id,
        `Task status changed to: ${status}`,
        req.ip,
        req.headers["user-agent"]
      );
    }

    if (assignedTo !== undefined) {
      logActivity(
        req.user._id,
        "Task Assigned",
        "Task",
        task._id,
        assignedTo ? `Task assigned to user ID: ${assignedTo}` : `Task unassigned`,
        req.ip,
        req.headers["user-agent"]
      );
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
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

    // Authorization check: Must be the creator of the task
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this task",
      });
    }

    await Task.findByIdAndDelete(id);

    // Log activity
    logActivity(
      req.user._id,
      "Task Deleted",
      "Task",
      task._id,
      `Task deleted: ${task.title}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

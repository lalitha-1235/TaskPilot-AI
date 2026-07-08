const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const { logActivity } = require("../utils/activityLogger");

// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    // Validate taskId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    // Validate required fields
    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide comment text",
      });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Create comment
    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      text: text,
    });

    // Populate user details for return response
    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email avatar role"
    );

    // Log activity
    logActivity(
      req.user._id,
      "Comment Added",
      "Comment",
      comment._id,
      `Comment added to task: ${task.title}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(201).json({
      success: true,
      data: populatedComment,
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

// @desc    Get all comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate taskId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Fetch and populate comments
    const comments = await Comment.find({ task: taskId })
      .sort({ createdAt: 1 }) // Oldest first
      .populate("user", "name email avatar role");

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Update a comment
// @route   PUT /api/tasks/:taskId/comments/:commentId
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { text } = req.body;

    // Validate ObjectIds format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format",
      });
    }

    // Validate required fields
    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide comment text",
      });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Authorization check: Only the comment creator can edit
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to edit this comment",
      });
    }

    // Update text
    comment.text = text;
    await comment.save();

    // Populate user details for return response
    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email avatar role"
    );

    // Log activity
    logActivity(
      req.user._id,
      "Comment Updated",
      "Comment",
      comment._id,
      `Comment updated on task: ${task.title}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      data: populatedComment,
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

// @desc    Delete a comment
// @route   DELETE /api/tasks/:taskId/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    // Validate ObjectIds format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format",
      });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Authorization check: Only the comment creator can delete
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    // Log activity
    logActivity(
      req.user._id,
      "Comment Deleted",
      "Comment",
      comment._id,
      `Comment deleted from task: ${task.title}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

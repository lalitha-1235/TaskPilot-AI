const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const File = require("../models/File");
const Task = require("../models/Task");
const Team = require("../models/Team");
const { logActivity } = require("../utils/activityLogger");

// @desc    Upload a single file
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please select a file to upload.",
      });
    }

    const { relatedTask, relatedTeam } = req.body;

    // Validate relatedTask if provided
    if (relatedTask) {
      if (!mongoose.Types.ObjectId.isValid(relatedTask)) {
        return res.status(400).json({
          success: false,
          message: "Invalid related task ID format",
        });
      }
      const taskExists = await Task.findById(relatedTask);
      if (!taskExists) {
        return res.status(404).json({
          success: false,
          message: "Related task not found",
        });
      }
    }

    // Validate relatedTeam if provided
    if (relatedTeam) {
      if (!mongoose.Types.ObjectId.isValid(relatedTeam)) {
        return res.status(400).json({
          success: false,
          message: "Invalid related team ID format",
        });
      }
      const teamExists = await Team.findById(relatedTeam);
      if (!teamExists) {
        return res.status(404).json({
          success: false,
          message: "Related team not found",
        });
      }
    }

    // Create file record in DB
    const fileRecord = await File.create({
      uploadedBy: req.user._id,
      relatedTask: relatedTask || null,
      relatedTeam: relatedTeam || null,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    // Log activity
    logActivity(
      req.user._id,
      "File Uploaded",
      "File",
      fileRecord._id,
      `Uploaded file: ${fileRecord.originalName} (${fileRecord.size} bytes)`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(201).json({
      success: true,
      data: fileRecord,
    });
  } catch (error) {
    // If db save fails, clean up the uploaded file from disk
    if (req.file) {
      const tempPath = path.join(__dirname, "../uploads", req.file.filename);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get files uploaded by logged-in user
// @route   GET /api/files
// @access  Private
exports.getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email avatar");

    return res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get all files attached to a specific task
// @route   GET /api/files/task/:taskId
// @access  Private
exports.getTaskFiles = async (req, res) => {
  try {
    const { taskId } = req.params;

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

    const files = await File.find({ relatedTask: taskId })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email avatar");

    return res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Delete file record and physical file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID format",
      });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Authorization check: Only the uploader can delete
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this file",
      });
    }

    // Remove the physical file from disk
    const physicalPath = path.join(__dirname, "../uploads", file.fileName);
    if (fs.existsSync(physicalPath)) {
      try {
        fs.unlinkSync(physicalPath);
      } catch (err) {
        console.error(`Error deleting physical file: ${err.message}`);
        // Continue database deletion even if physical file deletion failed (e.g. file already missing)
      }
    }

    await File.findByIdAndDelete(id);

    // Log activity
    logActivity(
      req.user._id,
      "File Deleted",
      "File",
      file._id,
      `Deleted file: ${file.originalName}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

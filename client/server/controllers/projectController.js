const mongoose = require("mongoose");
const Project = require("../models/Project");
const { logActivity } = require("../utils/activityLogger");

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const query = { createdBy: req.user._id };

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Optional priority filter
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email avatar");

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    const project = await Project.findById(id).populate(
      "createdBy",
      "name email avatar"
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: only the creator can view
    if (project.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view this project",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { name, description, status, priority, progress, healthScore, dueDate, team } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a project name",
      });
    }

    const project = await Project.create({
      name,
      description: description || "",
      status: status || "Planning",
      priority: priority || "Medium",
      progress: parseInt(progress) || 0,
      healthScore: parseInt(healthScore) || 90,
      dueDate: dueDate || null,
      team: team || [],
      createdBy: req.user._id,
    });

    logActivity(
      req.user._id,
      "Project Created",
      "System",
      project._id,
      `Project created: ${project.name}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(201).json({
      success: true,
      data: project,
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
      message: `Server Error: ${error.message}`,
    });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    let project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: only the creator can update
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to update this project",
      });
    }

    const { name, description, status, priority, progress, healthScore, dueDate, team } =
      req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (progress !== undefined) updates.progress = parseInt(progress);
    if (healthScore !== undefined) updates.healthScore = parseInt(healthScore);
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (team !== undefined) updates.team = team;

    project = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email avatar");

    logActivity(
      req.user._id,
      "Project Updated",
      "System",
      project._id,
      `Project updated: ${project.name}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      data: project,
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
      message: `Server Error: ${error.message}`,
    });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: only the creator can delete
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this project",
      });
    }

    await Project.findByIdAndDelete(id);

    logActivity(
      req.user._id,
      "Project Deleted",
      "System",
      project._id,
      `Project deleted: ${project.name}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};

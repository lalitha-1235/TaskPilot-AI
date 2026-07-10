const mongoose = require("mongoose");
const TeamMember = require("../models/TeamMember");
const { logActivity } = require("../utils/activityLogger");

// ─── Helper: derive initials from name ────────────────────────────────────────
function deriveInitials(name) {
  return name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// @desc    Get all team members for the logged-in user
// @route   GET /api/team-members
// @access  Private
exports.getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get a single team member
// @route   GET /api/team-members/:id
// @access  Private
exports.getTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID format",
      });
    }

    const member = await TeamMember.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Create a new team member
// @route   POST /api/team-members
// @access  Private
exports.createTeamMember = async (req, res) => {
  try {
    const {
      name,
      title,
      role,
      status,
      email,
      github,
      location,
      initials,
      gradient,
      border,
      glow,
      aiScore,
      tasksCompleted,
      velocity,
      availability,
      skills,
      projects,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide a name and email",
      });
    }

    const memberData = {
      createdBy: req.user._id,
      name,
      email,
      title: title || "Team Member",
      role: role || "Engineering",
      status: status || "online",
      github: github || "—",
      location: location || "Remote",
      initials: initials || deriveInitials(name),
      gradient: gradient || "from-violet-500 to-purple-400",
      border: border || "border-zinc-700/40",
      glow: glow || "shadow-zinc-500/10",
      aiScore: aiScore !== undefined ? parseInt(aiScore) : 90,
      tasksCompleted: tasksCompleted !== undefined ? parseInt(tasksCompleted) : 0,
      velocity: velocity !== undefined ? parseInt(velocity) : 88,
      availability: availability !== undefined ? parseInt(availability) : 80,
      skills: Array.isArray(skills) ? skills : [],
      projects: Array.isArray(projects) ? projects : [],
    };

    const member = await TeamMember.create(memberData);

    logActivity(
      req.user._id,
      "Team Member Created",
      "TeamMember",
      member._id,
      `New team member added: ${member.name}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(201).json({
      success: true,
      data: member,
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

// @desc    Update a team member
// @route   PUT /api/team-members/:id
// @access  Private
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID format",
      });
    }

    const member = await TeamMember.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    const allowedFields = [
      "name", "title", "role", "status", "email", "github", "location",
      "initials", "gradient", "border", "glow",
      "aiScore", "tasksCompleted", "velocity", "availability",
      "skills", "projects",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Auto-update initials if name changed
    if (updates.name && !req.body.initials) {
      updates.initials = deriveInitials(updates.name);
    }

    const updatedMember = await TeamMember.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    logActivity(
      req.user._id,
      "Team Member Updated",
      "TeamMember",
      updatedMember._id,
      `Team member updated: ${updatedMember.name}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      data: updatedMember,
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

// @desc    Delete a team member
// @route   DELETE /api/team-members/:id
// @access  Private
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID format",
      });
    }

    const member = await TeamMember.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    await TeamMember.findByIdAndDelete(id);

    logActivity(
      req.user._id,
      "Team Member Deleted",
      "TeamMember",
      member._id,
      `Team member deleted: ${member.name}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

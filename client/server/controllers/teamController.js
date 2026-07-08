const mongoose = require("mongoose");
const Team = require("../models/Team");
const User = require("../models/User");

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide a team name",
      });
    }

    // Create team with the current user as owner
    const team = await Team.create({
      name,
      description: description || "",
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "Owner",
        },
      ],
    });

    // Populate owner and member user details for response
    const populatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return res.status(201).json({
      success: true,
      data: populatedTeam,
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

// @desc    Get all teams for the logged-in user (teams they own or are a member of)
// @route   GET /api/teams
// @access  Private
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
      ],
    })
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

// @desc    Get a single team
// @route   GET /api/teams/:id
// @access  Private (must be a member of the team)
exports.getTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format",
      });
    }

    const team = await Team.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Authorization check: Must be a member of the team
    const isMember = team.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a member of this team",
      });
    }

    return res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Update a team (name, description)
// @route   PUT /api/teams/:id
// @access  Private (Owner or Admin only)
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validate ObjectId format
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

    // Authorization check: Must be Owner or Admin
    const memberRecord = team.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!memberRecord || !["Owner", "Admin"].includes(memberRecord.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Only the team Owner or Admin can update team details",
      });
    }

    // Update fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const updatedTeam = await Team.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return res.status(200).json({
      success: true,
      data: updatedTeam,
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

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private (Owner only)
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
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

    // Authorization check: Only the Owner can delete a team
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the team Owner can delete this team",
      });
    }

    await Team.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Add a member to a team (invite by email)
// @route   POST /api/teams/:id/members
// @access  Private (Owner or Admin only)
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format",
      });
    }

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide the email of the user to add",
      });
    }

    // Validate role if provided
    const memberRole = role || "Member";
    if (!["Admin", "Member"].includes(memberRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either: Admin or Member",
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Authorization check: Must be Owner or Admin to add members
    const requesterRecord = team.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (
      !requesterRecord ||
      !["Owner", "Admin"].includes(requesterRecord.role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Only the team Owner or Admin can add members",
      });
    }

    // Only the Owner can add someone as Admin
    if (memberRole === "Admin" && requesterRecord.role !== "Owner") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the team Owner can assign the Admin role",
      });
    }

    // Find the user to add by email
    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email address",
      });
    }

    // Check if user is already a member
    const alreadyMember = team.members.some(
      (member) => member.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "This user is already a member of the team",
      });
    }

    // Add user to team
    team.members.push({
      user: userToAdd._id,
      role: memberRole,
    });

    await team.save();

    // Return populated team
    const populatedTeam = await Team.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return res.status(200).json({
      success: true,
      message: `${userToAdd.name} has been added to the team as ${memberRole}`,
      data: populatedTeam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Remove a member from a team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (Owner or Admin only; Admin cannot remove Owner or other Admins)
exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Authorization check: Must be Owner or Admin
    const requesterRecord = team.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (
      !requesterRecord ||
      !["Owner", "Admin"].includes(requesterRecord.role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Only the team Owner or Admin can remove members",
      });
    }

    // Find the member to remove
    const memberToRemove = team.members.find(
      (member) => member.user.toString() === userId
    );

    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        message: "This user is not a member of the team",
      });
    }

    // Owner cannot be removed
    if (memberToRemove.role === "Owner") {
      return res.status(400).json({
        success: false,
        message: "The team Owner cannot be removed from the team",
      });
    }

    // Admin can only remove Members, not other Admins
    if (
      requesterRecord.role === "Admin" &&
      memberToRemove.role === "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: An Admin cannot remove another Admin",
      });
    }

    // Remove the member
    team.members = team.members.filter(
      (member) => member.user.toString() !== userId
    );

    await team.save();

    // Return populated team
    const populatedTeam = await Team.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return res.status(200).json({
      success: true,
      message: "Member removed from the team successfully",
      data: populatedTeam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Update a member's role in a team
// @route   PUT /api/teams/:id/members/:userId
// @access  Private (Owner only)
exports.updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Validate role
    if (!role || !["Admin", "Member"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either: Admin or Member",
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Authorization check: Only the Owner can change roles
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the team Owner can update member roles",
      });
    }

    // Find the member to update
    const memberIndex = team.members.findIndex(
      (member) => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "This user is not a member of the team",
      });
    }

    // Cannot change the Owner's own role
    if (team.members[memberIndex].role === "Owner") {
      return res.status(400).json({
        success: false,
        message: "Cannot change the role of the team Owner",
      });
    }

    // Update the role
    team.members[memberIndex].role = role;
    await team.save();

    // Return populated team
    const populatedTeam = await Team.findById(id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return res.status(200).json({
      success: true,
      message: `Member role updated to ${role} successfully`,
      data: populatedTeam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

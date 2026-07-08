const mongoose = require("mongoose");
const TeamInvitation = require("../models/TeamInvitation");
const Team = require("../models/Team");
const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");

// @desc    Send a team invitation
// @route   POST /api/team-invitations
// @access  Private (Owner or Admin only)
exports.sendInvitation = async (req, res) => {
  try {
    const { team, recipient, message } = req.body;

    // Validate inputs
    if (!team || !recipient) {
      return res.status(400).json({
        success: false,
        message: "Please provide team ID and recipient ID",
      });
    }

    // Validate ObjectIds format
    if (!mongoose.Types.ObjectId.isValid(team)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(recipient)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID format",
      });
    }

    // Prevent inviting yourself
    if (recipient.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot invite yourself to a team",
      });
    }

    // Verify team exists
    const teamDoc = await Team.findById(team);
    if (!teamDoc) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Authorization check: Only team Owner or Admin can invite
    const senderRecord = teamDoc.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!senderRecord || !["Owner", "Admin"].includes(senderRecord.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the team Owner or Admin can send invitations",
      });
    }

    // Verify recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    // Prevent inviting users already in the team
    const alreadyMember = teamDoc.members.some(
      (m) => m.user.toString() === recipient.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this team",
      });
    }

    // Prevent duplicate pending/valid invitations
    const existingInvitation = await TeamInvitation.findOne({
      team,
      recipient,
      status: "Pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: "A pending invitation already exists for this user",
      });
    }

    // Create invitation
    const invitation = await TeamInvitation.create({
      team,
      sender: req.user._id,
      recipient,
      message: message || "",
      status: "Pending",
    });

    const populatedInvitation = await TeamInvitation.findById(invitation._id)
      .populate("recipient", "name email avatar")
      .populate("sender", "name email avatar")
      .populate("team", "name");

    // Log activity
    logActivity(
      req.user._id,
      "Invitation Sent",
      "Invitation",
      invitation._id,
      `Team invitation sent to user ID: ${invitation.recipient}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(201).json({
      success: true,
      data: populatedInvitation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get all invitations received by logged-in user
// @route   GET /api/team-invitations
// @access  Private
exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await TeamInvitation.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .populate("sender", "name email avatar")
      .populate("team", "name");

    return res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Accept a team invitation
// @route   PUT /api/team-invitations/:id/accept
// @access  Private
exports.acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invitation ID format",
      });
    }

    const invitation = await TeamInvitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Verify invitation belongs to logged-in user
    if (invitation.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to accept this invitation",
      });
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invitation has expired",
      });
    }

    // Verify status is Pending
    if (invitation.status === "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been accepted",
      });
    }

    if (invitation.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been rejected",
      });
    }

    if (invitation.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been cancelled",
      });
    }

    // Add recipient to the team
    const team = await Team.findById(invitation.team);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Double check that user isn't already inside the team
    const alreadyMember = team.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      team.members.push({
        user: req.user._id,
        role: "Member",
        joinedAt: new Date(),
      });
      await team.save();
    }

    // Update status to Accepted
    invitation.status = "Accepted";
    await invitation.save();

    // Log activity
    logActivity(
      req.user._id,
      "Invitation Accepted",
      "Invitation",
      invitation._id,
      `Accepted invitation to join team: ${team.name}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: invitation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Reject a team invitation
// @route   PUT /api/team-invitations/:id/reject
// @access  Private
exports.rejectInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invitation ID format",
      });
    }

    const invitation = await TeamInvitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Verify invitation belongs to logged-in user
    if (invitation.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to reject this invitation",
      });
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invitation has expired",
      });
    }

    // Verify status is Pending
    if (invitation.status === "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been accepted",
      });
    }

    if (invitation.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been rejected",
      });
    }

    if (invitation.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been cancelled",
      });
    }

    // Update status to Rejected
    invitation.status = "Rejected";
    await invitation.save();

    // Log activity
    logActivity(
      req.user._id,
      "Invitation Rejected",
      "Invitation",
      invitation._id,
      `Rejected invitation to join team ID: ${invitation.team}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Invitation rejected successfully",
      data: invitation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Cancel a team invitation
// @route   PUT /api/team-invitations/:id/cancel
// @access  Private (Sender only)
exports.cancelInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invitation ID format",
      });
    }

    const invitation = await TeamInvitation.findById(id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Verify caller is the sender of the invitation
    if (invitation.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the sender can cancel this invitation",
      });
    }

    // Verify status is Pending
    if (invitation.status === "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been accepted and cannot be cancelled",
      });
    }

    if (invitation.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been rejected and cannot be cancelled",
      });
    }

    if (invitation.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been cancelled",
      });
    }

    // Update status to Cancelled
    invitation.status = "Cancelled";
    await invitation.save();

    // Log activity
    logActivity(
      req.user._id,
      "Invitation Cancelled",
      "Invitation",
      invitation._id,
      `Cancelled invitation sent to user ID: ${invitation.recipient}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
      data: invitation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

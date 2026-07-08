const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { logActivity } = require("../utils/activityLogger");

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .populate("sender", "name email avatar role")
      .populate("relatedTask", "title")
      .populate("relatedTeam", "name");

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Authorization check: Must be the recipient of the notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to access this notification",
      });
    }

    notification.isRead = true;
    await notification.save();

    // Log activity
    logActivity(
      req.user._id,
      "Notification Read",
      "Notification",
      notification._id,
      `Notification marked as read: ${notification.message}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Mark all notifications for logged-in user as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    // Log activity
    logActivity(
      req.user._id,
      "All Notifications Read",
      "Notification",
      null,
      `Marked all notifications as read (${result.modifiedCount} updated)`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      data: {
        updatedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Authorization check: Must be the recipient of the notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this notification",
      });
    }

    await Notification.findByIdAndDelete(id);

    // Log activity
    logActivity(
      req.user._id,
      "Notification Deleted",
      "Notification",
      notification._id,
      `Notification deleted: ${notification.message}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

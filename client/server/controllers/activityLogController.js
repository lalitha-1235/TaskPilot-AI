const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");

// @desc    Get activity logs for logged-in user
// @route   GET /api/activity-logs
// @access  Private
exports.getMyActivityLogs = async (req, res) => {
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

    const query = { user: req.user._id };

    // Fetch total count and logs in parallel
    const [total, logs] = await Promise.all([
      ActivityLog.countDocuments(query),
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email avatar"),
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Get activity logs for one entity belonging to logged-in user
// @route   GET /api/activity-logs/entity/:entityType/:entityId
// @access  Private
exports.getActivityByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    // Validate entityId format
    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity ID format",
      });
    }

    // Validate entityType enum
    const allowedEntityTypes = [
      "Task",
      "Team",
      "Comment",
      "Notification",
      "Invitation",
      "File",
      "Profile",
      "Authentication",
      "System",
    ];

    if (!allowedEntityTypes.includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity type specified",
      });
    }

    // Filter by the requested entity AND restrict to the logged-in user
    const query = {
      entityType,
      entityId,
      user: req.user._id,
    };

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email avatar");

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

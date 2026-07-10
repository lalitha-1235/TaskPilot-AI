const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An activity log must be associated with a user"],
    },
    action: {
      type: String,
      required: [true, "Action description is required"],
      trim: true,
    },
    entityType: {
      type: String,
      enum: [
        "Task",
        "Team",
        "Comment",
        "Notification",
        "Invitation",
        "File",
        "Profile",
        "Authentication",
        "System",
        "ChatMessage",
      ],
      required: [true, "Entity type is required"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1, user: 1 });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);

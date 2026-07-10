const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    initials: { type: String, required: true, trim: true, maxlength: 3 },
    bg: { type: String, default: "" },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a project name"],
      trim: true,
      maxlength: [150, "Project name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["Planning", "In Progress", "In Review", "Completed", "Blocked"],
        message: "Status must be: Planning, In Progress, In Review, Completed, or Blocked",
      },
      default: "Planning",
    },
    priority: {
      type: String,
      enum: {
        values: ["High", "Medium", "Low"],
        message: "Priority must be: High, Medium, or Low",
      },
      default: "Medium",
    },
    progress: {
      type: Number,
      min: [0, "Progress cannot be less than 0"],
      max: [100, "Progress cannot exceed 100"],
      default: 0,
    },
    healthScore: {
      type: Number,
      min: [0, "Health score cannot be less than 0"],
      max: [100, "Health score cannot exceed 100"],
      default: 90,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    team: {
      type: [TeamMemberSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A project must belong to a user"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
ProjectSchema.index({ createdBy: 1, status: 1 });
ProjectSchema.index({ createdBy: 1, priority: 1 });
ProjectSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("Project", ProjectSchema);

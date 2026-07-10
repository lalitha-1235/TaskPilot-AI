const mongoose = require("mongoose");

const AssigneeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    initials: { type: String, required: true, trim: true, maxlength: 3 },
    color: { type: String, default: "" },
  },
  { _id: false }
);

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    project: {
      type: String,
      trim: true,
      default: "General",
    },
    status: {
      type: String,
      enum: {
        values: ["Todo", "In Progress", "Review", "Completed", "Blocked"],
        message: "Status must be either: Todo, In Progress, Review, Completed, or Blocked",
      },
      default: "Todo",
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Priority must be either: Low, Medium, or High",
      },
      default: "Medium",
    },
    progress: {
      type: Number,
      min: [0, "Progress cannot be less than 0"],
      max: [100, "Progress cannot exceed 100"],
      default: 0,
    },
    riskScore: {
      type: Number,
      min: [0, "Risk score cannot be less than 0"],
      max: [100, "Risk score cannot exceed 100"],
      default: 20,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    assignee: {
      type: AssigneeSchema,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A task must belong to a user"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
TaskSchema.index({ createdBy: 1, status: 1 });
TaskSchema.index({ createdBy: 1, dueDate: 1 });
TaskSchema.index({ createdBy: 1, priority: 1 });

module.exports = mongoose.model("Task", TaskSchema);

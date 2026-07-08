const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "A comment must belong to a task"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A comment must belong to a user"],
    },
    text: {
      type: String,
      required: [true, "Please provide the comment text"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for common query pattern (fetch all comments for a task)
CommentSchema.index({ task: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", CommentSchema);

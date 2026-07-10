const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
      index: true,
    },
    sender: {
      type: String,
      enum: {
        values: ["user", "ai"],
        message: "Sender must be either user or ai",
      },
      required: [true, "Sender is required"],
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for query efficiency
ChatMessageSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);

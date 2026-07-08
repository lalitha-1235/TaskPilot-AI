const mongoose = require("mongoose");

const TeamInvitationSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "An invitation must be associated with a team"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An invitation must have a sender"],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An invitation must have a recipient"],
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Accepted", "Rejected", "Cancelled"],
        message: "Status must be Pending, Accepted, Rejected, or Cancelled",
      },
      default: "Pending",
    },
    message: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Current date + 7 days
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the virtual/field index for expiry works properly if Mongoose uses TTL, but here it's just a normal date field unless user wants TTL.
// We will validate expiry manually in our business logic code.

// TTL index: MongoDB will automatically remove expired invitation documents after expiry
TeamInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Index for common query: all invitations for a recipient by status
TeamInvitationSchema.index({ recipient: 1, status: 1 });

module.exports = mongoose.model("TeamInvitation", TeamInvitationSchema);

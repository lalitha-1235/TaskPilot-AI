const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: {
        values: ["Owner", "Admin", "Member"],
        message: "Role must be either: Owner, Admin, or Member",
      },
      default: "Member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a team name"],
      trim: true,
      maxlength: [100, "Team name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A team must have an owner"],
    },
    members: {
      type: [MemberSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user appears only once in the members array
TeamSchema.index({ "members.user": 1 });

module.exports = mongoose.model("Team", TeamSchema);

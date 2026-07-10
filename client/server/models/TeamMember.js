const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema(
  {
    // The workspace owner — used to scope members per-user
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
      index: true,
    },

    // ── Profile ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    title: {
      type: String,
      trim: true,
      default: "Team Member",
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["Engineering", "Design", "DevOps", "QA", "AI Agent", "Leadership"],
        message: "Role must be one of: Engineering, Design, DevOps, QA, AI Agent, Leadership",
      },
      default: "Engineering",
    },
    status: {
      type: String,
      enum: {
        values: ["online", "away", "offline"],
        message: "Status must be: online, away, or offline",
      },
      default: "online",
    },

    // ── Contact ───────────────────────────────────────────────────────────────
    email: {
      type: String,
      required: [true, "Please provide an email"],
      trim: true,
      lowercase: true,
    },
    github: {
      type: String,
      trim: true,
      default: "—",
    },
    location: {
      type: String,
      trim: true,
      default: "Remote",
    },

    // ── Visual / Display ──────────────────────────────────────────────────────
    initials: {
      type: String,
      trim: true,
      maxlength: [3, "Initials cannot exceed 3 characters"],
    },
    gradient: {
      type: String,
      default: "from-violet-500 to-purple-400",
    },
    border: {
      type: String,
      default: "border-zinc-700/40",
    },
    glow: {
      type: String,
      default: "shadow-zinc-500/10",
    },

    // ── Stats ─────────────────────────────────────────────────────────────────
    aiScore: {
      type: Number,
      min: [0, "AI Score must be at least 0"],
      max: [100, "AI Score cannot exceed 100"],
      default: 90,
    },
    tasksCompleted: {
      type: Number,
      min: [0, "Tasks completed cannot be negative"],
      default: 0,
    },
    velocity: {
      type: Number,
      min: [0, "Velocity must be at least 0"],
      max: [100, "Velocity cannot exceed 100"],
      default: 88,
    },
    availability: {
      type: Number,
      min: [0, "Availability must be at least 0"],
      max: [100, "Availability cannot exceed 100"],
      default: 80,
    },

    // ── Arrays ────────────────────────────────────────────────────────────────
    skills: {
      type: [String],
      default: [],
    },
    projects: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient per-user member queries
TeamMemberSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("TeamMember", TeamMemberSchema);

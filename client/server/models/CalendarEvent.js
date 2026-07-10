const mongoose = require("mongoose");

const CalendarEventSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Please provide an event title"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    date: {
      type: String, // stored as "YYYY-MM-DD" for simple calendar matching
      required: [true, "Please provide a date"],
    },
    time: {
      type: String,
      default: "09:00",
    },
    duration: {
      type: String,
      default: "1h",
    },
    type: {
      type: String,
      enum: {
        values: ["meeting", "deadline", "ai_review", "sprint", "personal"],
        message: "Type must be: meeting, deadline, ai_review, sprint, or personal",
      },
      default: "meeting",
    },
    project: {
      type: String,
      trim: true,
      default: "—",
    },
    // Source flags: helps the frontend distinguish read-only auto events from custom ones
    source: {
      type: String,
      enum: ["custom", "task", "project"],
      default: "custom",
    },
    // Ref to the originating document (if source is task or project)
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

CalendarEventSchema.index({ createdBy: 1, date: 1 });

module.exports = mongoose.model("CalendarEvent", CalendarEventSchema);

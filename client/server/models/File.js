const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A file must belong to an uploader"],
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    relatedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, "Saved filename is required"],
      unique: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, "File path is required"],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, "Mime type is required"],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", FileSchema);

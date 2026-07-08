const express = require("express");
const router = express.Router();
const {
  uploadFile,
  getMyFiles,
  getTaskFiles,
  deleteFile,
} = require("../controllers/fileController");
const handleUpload = require("../middleware/upload");
const { protect } = require("../middleware/auth");

// Protect all routes
router.use(protect);

// POST Upload file
router.post("/upload", handleUpload, uploadFile);

// GET Logged user's uploads
router.get("/", getMyFiles);

// GET Task attachments
router.get("/task/:taskId", getTaskFiles);

// DELETE File
router.delete("/:id", deleteFile);

module.exports = router;

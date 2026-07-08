const express = require("express");
const router = express.Router();
const {
  getMyActivityLogs,
  getActivityByEntity,
} = require("../controllers/activityLogController");
const { protect } = require("../middleware/auth");

// Protect all routes
router.use(protect);

// GET Logged user's activity logs
router.route("/").get(getMyActivityLogs);

// GET Activity logs by specific entity (Task, Team, etc.)
router.route("/entity/:entityType/:entityId").get(getActivityByEntity);

module.exports = router;

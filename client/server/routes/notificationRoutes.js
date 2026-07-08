const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

// All notification routes are protected by JWT authentication
router.use(protect);

router.route("/").get(getNotifications);

// Put /read-all BEFORE /:id/read and /:id so it doesn't get matched as an ID param
router.route("/read-all").put(markAllNotificationsRead);

router.route("/:id/read").put(markNotificationRead);

router.route("/:id").delete(deleteNotification);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} = require("../controllers/calendarController");
const { protect } = require("../middleware/auth");

// All routes protected by JWT authentication
router.use(protect);

router.route("/events").get(getCalendarEvents).post(createCalendarEvent);

router.route("/events/:id").put(updateCalendarEvent).delete(deleteCalendarEvent);

module.exports = router;

const Task = require("../models/Task");
const Project = require("../models/Project");
const CalendarEvent = require("../models/CalendarEvent");
const { logActivity } = require("../utils/activityLogger");

// ─── Helper: normalize a Date to "YYYY-MM-DD" string ──────────────────────────
function toDateStr(d) {
  if (!d) return null;
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// @desc    Get all calendar events (tasks due dates + project deadlines + custom events)
// @route   GET /api/calendar/events
// @access  Private
exports.getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    // Optional query filters: ?start=YYYY-MM-DD&end=YYYY-MM-DD
    const { start, end } = req.query;

    // ── 1. Fetch tasks that have a dueDate ────────────────────────────────────
    const taskQuery = {
      createdBy: userId,
      dueDate: { $ne: null },
    };
    if (start || end) {
      taskQuery.dueDate = {};
      if (start) taskQuery.dueDate.$gte = new Date(start);
      if (end) taskQuery.dueDate.$lte = new Date(end + "T23:59:59.999Z");
    }

    const tasks = await Task.find(taskQuery).select("title project dueDate priority status").lean();

    const taskEvents = tasks.map((t) => ({
      _id: `task-${t._id}`,
      id: `task-${t._id}`,
      title: t.title,
      date: toDateStr(t.dueDate),
      time: "23:59",
      duration: "—",
      type: "deadline",
      project: t.project || "General",
      source: "task",
      sourceId: t._id,
      priority: t.priority,
      taskStatus: t.status,
    }));

    // ── 2. Fetch projects that have a dueDate ─────────────────────────────────
    const projectQuery = {
      createdBy: userId,
      dueDate: { $ne: null },
    };
    if (start || end) {
      projectQuery.dueDate = {};
      if (start) projectQuery.dueDate.$gte = new Date(start);
      if (end) projectQuery.dueDate.$lte = new Date(end + "T23:59:59.999Z");
    }

    const projects = await Project.find(projectQuery).select("name dueDate status priority").lean();

    const projectEvents = projects.map((p) => ({
      _id: `project-${p._id}`,
      id: `project-${p._id}`,
      title: `${p.name} — Deadline`,
      date: toDateStr(p.dueDate),
      time: "18:00",
      duration: "—",
      type: "sprint",
      project: p.name,
      source: "project",
      sourceId: p._id,
      priority: p.priority,
      projectStatus: p.status,
    }));

    // ── 3. Fetch custom calendar events ───────────────────────────────────────
    const customQuery = { createdBy: userId };
    if (start) customQuery.date = { $gte: start };
    if (end) customQuery.date = { ...customQuery.date, $lte: end };

    const customEvents = await CalendarEvent.find(customQuery)
      .sort({ date: 1, time: 1 })
      .lean();

    const formattedCustom = customEvents.map((ev) => ({
      _id: ev._id,
      id: ev._id,
      title: ev.title,
      date: ev.date,
      time: ev.time,
      duration: ev.duration,
      type: ev.type,
      project: ev.project,
      source: "custom",
      sourceId: null,
    }));

    // ── 4. Merge and sort all events by date ──────────────────────────────────
    const allEvents = [...taskEvents, ...projectEvents, ...formattedCustom]
      .filter((e) => e.date) // Remove events with no date
      .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));

    return res.status(200).json({
      success: true,
      count: allEvents.length,
      data: allEvents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Create a custom calendar event
// @route   POST /api/calendar/events
// @access  Private
exports.createCalendarEvent = async (req, res) => {
  try {
    const { title, date, time, duration, type, project } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide a title and date",
      });
    }

    const event = await CalendarEvent.create({
      createdBy: req.user._id,
      title,
      date,
      time: time || "09:00",
      duration: duration || "1h",
      type: type || "meeting",
      project: project || "—",
      source: "custom",
    });

    logActivity(
      req.user._id,
      "Calendar Event Created",
      "CalendarEvent",
      event._id,
      `Custom calendar event created: ${event.title} on ${event.date}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(201).json({
      success: true,
      data: {
        _id: event._id,
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        duration: event.duration,
        type: event.type,
        project: event.project,
        source: "custom",
        sourceId: null,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Update a custom calendar event
// @route   PUT /api/calendar/events/:id
// @access  Private
exports.updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({
      _id: id,
      createdBy: req.user._id,
      source: "custom",
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Custom calendar event not found",
      });
    }

    const allowedFields = ["title", "date", "time", "duration", "type", "project"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    await event.save();

    return res.status(200).json({
      success: true,
      data: {
        _id: event._id,
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        duration: event.duration,
        type: event.type,
        project: event.project,
        source: "custom",
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// @desc    Delete a custom calendar event
// @route   DELETE /api/calendar/events/:id
// @access  Private
exports.deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({
      _id: id,
      createdBy: req.user._id,
      source: "custom",
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Custom calendar event not found or cannot be deleted (task/project events are read-only)",
      });
    }

    await CalendarEvent.findByIdAndDelete(id);

    logActivity(
      req.user._id,
      "Calendar Event Deleted",
      "CalendarEvent",
      event._id,
      `Custom calendar event deleted: ${event.title}`,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      success: true,
      message: "Calendar event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

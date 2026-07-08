const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

// All routes in this file are protected by JWT authentication
router.use(protect);

router.route("/")
  .post(createTask)
  .get(getTasks);

router.route("/:id")
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;

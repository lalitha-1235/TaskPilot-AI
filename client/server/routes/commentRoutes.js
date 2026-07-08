const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

// Protect all routes
router.use(protect);

router
  .route("/:taskId/comments")
  .post(addComment)
  .get(getComments);

router
  .route("/:taskId/comments/:commentId")
  .put(updateComment)
  .delete(deleteComment);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamMemberController");
const { protect } = require("../middleware/auth");

// All routes protected by JWT authentication
router.use(protect);

router.route("/").get(getTeamMembers).post(createTeamMember);

router
  .route("/:id")
  .get(getTeamMember)
  .put(updateTeamMember)
  .delete(deleteTeamMember);

module.exports = router;

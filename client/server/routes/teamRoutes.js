const express = require("express");
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
} = require("../controllers/teamController");
const { protect } = require("../middleware/auth");

// All routes in this file are protected by JWT authentication
router.use(protect);

// Team CRUD routes
router.route("/").post(createTeam).get(getTeams);

router.route("/:id").get(getTeam).put(updateTeam).delete(deleteTeam);

// Team member management routes
router.route("/:id/members").post(addMember);

router.route("/:id/members/:userId").put(updateMemberRole).delete(removeMember);

module.exports = router;

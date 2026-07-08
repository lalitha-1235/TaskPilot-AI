const express = require("express");
const router = express.Router();
const {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
} = require("../controllers/teamInvitationController");
const { protect } = require("../middleware/auth");

// Protect all routes
router.use(protect);

router
  .route("/")
  .post(sendInvitation)
  .get(getMyInvitations);

router.put("/:id/accept", acceptInvitation);
router.put("/:id/reject", rejectInvitation);
router.put("/:id/cancel", cancelInvitation);

module.exports = router;

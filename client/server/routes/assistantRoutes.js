const express = require("express");
const router = express.Router();
const {
  getChatHistory,
  sendChatMessage,
  clearChatHistory,
} = require("../controllers/assistantController");
const { protect } = require("../middleware/auth");

// All routes require JWT authentication protection
router.use(protect);

router.route("/chat").post(sendChatMessage).delete(clearChatHistory);

router.route("/history").get(getChatHistory);

module.exports = router;

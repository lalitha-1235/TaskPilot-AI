const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

// All profile routes are protected by JWT authentication
router.use(protect);

router
  .route("/")
  .get(getProfile)
  .put(updateProfile);

router.put("/change-password", changePassword);

module.exports = router;

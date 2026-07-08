const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

// All routes in this file are protected by JWT authentication
router.use(protect);

router.route("/").get(getDashboardData);

module.exports = router;

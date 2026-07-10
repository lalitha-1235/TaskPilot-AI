const express = require("express");
const router = express.Router();
const { getReportsSummary } = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

// Protect all report analytics routes with JWT authentication
router.use(protect);

router.get("/summary", getReportsSummary);

module.exports = router;

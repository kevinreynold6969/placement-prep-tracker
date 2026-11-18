const express = require('express');
const { getStats, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard/stats     — Summary statistics for dashboard cards
router.get('/stats', getStats);

// GET /api/dashboard/analytics — Chart data (topic breakdown, activity over time)
router.get('/analytics', getAnalytics);

module.exports = router;

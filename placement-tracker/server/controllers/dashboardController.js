const dashboardService = require('../services/dashboardService');

/**
 * Dashboard Controller
 *
 * Thin controller — delegates all computation to dashboardService.
 */

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user.id);

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    // Clamp days between 7 and 365
    const clampedDays = Math.min(365, Math.max(7, days));

    const analytics = await dashboardService.getAnalytics(req.user.id, clampedDays);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getAnalytics };

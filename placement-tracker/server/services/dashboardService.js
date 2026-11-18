const Problem = require('../models/Problem');
const mongoose = require('mongoose');

/**
 * Dashboard Service
 *
 * All statistics are computed from actual Problem documents belonging
 * to the authenticated user. No hardcoded numbers, no fake data.
 *
 * WHY AGGREGATION PIPELINES:
 * Dashboard stats require counting documents across multiple dimensions
 * (by status, by topic, by difficulty). Instead of running N separate
 * countDocuments() queries, MongoDB aggregation pipelines compute all
 * of these in a single operation inside the database — far more efficient.
 *
 * AGGREGATION PIPELINE STRUCTURE:
 * $match  — Filter documents (always first; uses index)
 * $group  — Group by a field and compute counts
 * $sort   — Sort results
 * $limit  — Limit result size
 *
 * IMPORTANT: mongoose.Types.ObjectId() is used to convert the userId
 * string to a MongoDB ObjectId before passing it to $match. Without this
 * conversion, the string "507f1f..." would not match the stored ObjectId
 * and the aggregation would return empty results.
 */

/**
 * getDashboardStats — Returns summary statistics for the dashboard cards.
 *
 * Returns:
 *   total           — Total problems recorded
 *   solved          — Problems with status 'solved'
 *   attempted       — Problems with status 'attempted'
 *   notAttempted    — Problems with status 'not_attempted'
 *   needsRevision   — Problems with status 'needs_revision'
 *   revisionBacklog — Problems where needsRevision = true (can include solved)
 *   byDifficulty    — Count per difficulty level
 *   byTopic         — Count per DSA topic
 *   recentActivity  — Problems added in the last 7 days, grouped by date
 */
const getDashboardStats = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Run all aggregations in parallel using Promise.all — faster than sequential awaits
  const [statusStats, difficultyStats, topicStats, revisionCount, recentActivity] =
    await Promise.all([
      // 1. Group by status
      Problem.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // 2. Group by difficulty
      Problem.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),

      // 3. Group by topic (top topics by problem count)
      Problem.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$topic', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 4. Count problems marked for revision
      Problem.countDocuments({ userId, needsRevision: true }),

      // 5. Activity in the last 7 days — group by date string
      Problem.aggregate([
        {
          $match: {
            userId: userObjectId,
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  // Transform aggregation results into clean objects
  // Convert [{ _id: 'solved', count: 10 }, ...] → { solved: 10, ... }
  const statusMap = statusStats.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  const difficultyMap = difficultyStats.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  const topicMap = topicStats.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  const total =
    (statusMap['solved'] || 0) +
    (statusMap['attempted'] || 0) +
    (statusMap['not_attempted'] || 0) +
    (statusMap['needs_revision'] || 0);

  return {
    total,
    solved: statusMap['solved'] || 0,
    attempted: statusMap['attempted'] || 0,
    notAttempted: statusMap['not_attempted'] || 0,
    needsRevision: statusMap['needs_revision'] || 0,
    revisionBacklog: revisionCount,
    byDifficulty: {
      Easy: difficultyMap['Easy'] || 0,
      Medium: difficultyMap['Medium'] || 0,
      Hard: difficultyMap['Hard'] || 0,
    },
    byTopic: topicMap,
    recentActivity: recentActivity.map(({ _id, count }) => ({
      date: _id,
      count,
    })),
  };
};

/**
 * getAnalytics — Returns detailed data for dashboard charts.
 *
 * Returns:
 *   topicBreakdown    — Per topic: total, solved, needs_revision
 *   difficultyBreakdown — Per difficulty: total, solved
 *   activityOverTime  — Per day over the last N days: problems added
 *   statusBreakdown   — Count per status (for pie/donut chart)
 */
const getAnalytics = async (userId, days = 30) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [topicBreakdown, difficultyBreakdown, activityOverTime, statusBreakdown] =
    await Promise.all([
      // Per-topic breakdown with status sub-counts
      Problem.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$topic',
            total: { $sum: 1 },
            solved: {
              $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] },
            },
            needsRevision: {
              $sum: { $cond: ['$needsRevision', 1, 0] },
            },
            attempted: {
              $sum: { $cond: [{ $eq: ['$status', 'attempted'] }, 1, 0] },
            },
          },
        },
        { $sort: { total: -1 } },
      ]),

      // Per-difficulty breakdown
      Problem.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$difficulty',
            total: { $sum: 1 },
            solved: {
              $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] },
            },
          },
        },
      ]),

      // Activity over time
      Problem.aggregate([
        { $match: { userId: userObjectId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            added: { $sum: 1 },
            solved: {
              $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Status breakdown for donut chart
      Problem.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

  return {
    topicBreakdown: topicBreakdown.map(({ _id, ...rest }) => ({
      topic: _id,
      ...rest,
    })),
    difficultyBreakdown: difficultyBreakdown.map(({ _id, ...rest }) => ({
      difficulty: _id,
      ...rest,
    })),
    activityOverTime: activityOverTime.map(({ _id, added, solved }) => ({
      date: _id,
      added,
      solved,
    })),
    statusBreakdown: statusBreakdown.map(({ _id, count }) => ({
      status: _id,
      count,
    })),
  };
};

module.exports = { getDashboardStats, getAnalytics };

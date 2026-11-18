const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const DSA_TOPICS = [
  'Arrays', 'Strings', 'Hashing', 'Two Pointers', 'Sliding Window',
  'Prefix Sum', 'Binary Search', 'Sorting', 'Greedy', 'Stack', 'Queue',
  'Linked Lists', 'Trees', 'Binary Search Trees', 'Heaps', 'Graphs',
  'Backtracking', 'Dynamic Programming',
];

const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'CodeChef', 'GeeksForGeeks', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['not_attempted', 'attempted', 'solved', 'needs_revision'];

// Reusable validate middleware (same logic as in authValidators)
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((err) => ({ field: err.path, message: err.msg }));
    return next(new ApiError(400, 'Validation failed', errors));
  }
  next();
};

/**
 * validateObjectId — Middleware to validate URL parameter :id is a valid MongoDB ObjectId.
 *
 * WHY THIS:
 * Without this check, Mongoose throws a CastError when an invalid ID is
 * passed to findById(). While the error handler translates CastErrors to 400,
 * this explicit check gives a cleaner, more specific error message.
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new ApiError(400, 'Invalid problem ID format'));
  }
  next();
};

/**
 * createProblemRules — Validation for POST /api/problems
 *
 * Required fields: title, platform, topic, difficulty, status
 * Optional fields: url, dateAttempted, notes, approach, timeComplexity, spaceComplexity, needsRevision
 */
const createProblemRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Problem title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),

  body('platform')
    .notEmpty().withMessage('Platform is required')
    .isIn(PLATFORMS).withMessage(`Platform must be one of: ${PLATFORMS.join(', ')}`),

  body('url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ require_protocol: true }).withMessage('Please provide a valid URL starting with http:// or https://'),

  body('topic')
    .notEmpty().withMessage('DSA topic is required')
    .isIn(DSA_TOPICS).withMessage('Invalid DSA topic selected'),

  body('difficulty')
    .notEmpty().withMessage('Difficulty is required')
    .isIn(DIFFICULTIES).withMessage('Difficulty must be Easy, Medium, or Hard'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),

  body('dateAttempted')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Date attempted must be a valid date')
    .toDate(), // Converts to a JavaScript Date object

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),

  body('approach')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Approach cannot exceed 2000 characters'),

  body('timeComplexity')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Time complexity cannot exceed 50 characters'),

  body('spaceComplexity')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Space complexity cannot exceed 50 characters'),

  body('needsRevision')
    .optional()
    .isBoolean().withMessage('needsRevision must be true or false')
    .toBoolean(), // Converts "true"/"false" strings to actual booleans
];

/**
 * updateProblemRules — Validation for PUT /api/problems/:id
 *
 * Same rules as create but all fields are optional — partial updates are allowed.
 * We only validate the fields that are present in the request body.
 */
const updateProblemRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),

  body('platform')
    .optional()
    .isIn(PLATFORMS).withMessage(`Platform must be one of: ${PLATFORMS.join(', ')}`),

  body('url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ require_protocol: true }).withMessage('Please provide a valid URL'),

  body('topic')
    .optional()
    .isIn(DSA_TOPICS).withMessage('Invalid DSA topic selected'),

  body('difficulty')
    .optional()
    .isIn(DIFFICULTIES).withMessage('Difficulty must be Easy, Medium, or Hard'),

  body('status')
    .optional()
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),

  body('dateAttempted')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Date attempted must be a valid date')
    .toDate(),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),

  body('approach')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Approach cannot exceed 2000 characters'),

  body('timeComplexity')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Time complexity cannot exceed 50 characters'),

  body('spaceComplexity')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Space complexity cannot exceed 50 characters'),

  body('needsRevision')
    .optional()
    .isBoolean().withMessage('needsRevision must be true or false')
    .toBoolean(),

  body('revisedAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('revisedAt must be a valid date')
    .toDate(),
];

module.exports = {
  validate,
  validateObjectId,
  createProblemRules,
  updateProblemRules,
  DSA_TOPICS,
  PLATFORMS,
  DIFFICULTIES,
  STATUSES,
};

const express = require('express');
const {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');
const {
  createProblemRules,
  updateProblemRules,
  validateObjectId,
  validate,
} = require('../validators/problemValidators');

const router = express.Router();

/**
 * Problem Routes
 *
 * All routes are protected — protect() middleware runs before every handler.
 * This is applied at the router level using router.use(protect), so we
 * don't have to repeat it on every route.
 *
 * Route middleware order:
 * protect → [validateObjectId if :id present] → [validation rules] → validate → controller
 */

// Apply auth middleware to ALL routes in this router
router.use(protect);

// GET /api/problems  — List problems with filtering and pagination
// POST /api/problems — Create a new problem
router
  .route('/')
  .get(getProblems)
  .post(createProblemRules, validate, createProblem);

// GET /api/problems/:id    — Get a single problem
// PUT /api/problems/:id    — Update a problem
// DELETE /api/problems/:id — Delete a problem
router
  .route('/:id')
  .get(validateObjectId, getProblemById)
  .put(validateObjectId, updateProblemRules, validate, updateProblem)
  .delete(validateObjectId, deleteProblem);

module.exports = router;

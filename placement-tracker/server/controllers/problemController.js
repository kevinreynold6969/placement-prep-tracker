const problemService = require('../services/problemService');

/**
 * Problem Controller
 *
 * Controllers are intentionally thin. Each function:
 *   1. Extracts data from the request (req.params, req.body, req.query)
 *   2. Calls the appropriate service function
 *   3. Sends the response
 *   4. Passes any error to next() for the centralised handler
 *
 * The service layer contains all business logic and database access.
 * The controller only handles HTTP concerns.
 */

const createProblem = async (req, res, next) => {
  try {
    // req.user.id is set by authMiddleware.protect()
    // We never use userId from req.body — always from the authenticated session
    const problem = await problemService.createProblem(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Problem added successfully',
      data: { problem },
    });
  } catch (error) {
    next(error);
  }
};

const getProblems = async (req, res, next) => {
  try {
    const result = await problemService.getProblems(req.user.id, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProblemById = async (req, res, next) => {
  try {
    const problem = await problemService.getProblemById(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: { problem },
    });
  } catch (error) {
    next(error);
  }
};

const updateProblem = async (req, res, next) => {
  try {
    const problem = await problemService.updateProblem(
      req.user.id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: { problem },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProblem = async (req, res, next) => {
  try {
    await problemService.deleteProblem(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};

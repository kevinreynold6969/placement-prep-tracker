const Problem = require('../models/Problem');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

/**
 * Problem Service
 *
 * WHY A SERVICE LAYER:
 * The service contains all business logic and database access.
 * Controllers are thin — they parse req, call a service, send res.
 * This means the same service functions can be called from tests,
 * cron jobs, or other routes without duplicating logic.
 *
 * OWNERSHIP MODEL:
 * Every function takes userId as its first argument.
 * Every query includes { userId } in the filter.
 * This guarantees data isolation between users at the query level.
 */

/**
 * createProblem — Creates a new problem record for the given user.
 *
 * WHY userId IS SET HERE, NOT FROM req.body:
 * The frontend cannot inject a different userId. The service always
 * uses the userId from req.user.id (set by auth middleware).
 * This prevents creating problems under another user's account.
 */
const createProblem = async (userId, data) => {
  const problem = await Problem.create({
    ...data,
    userId, // Always overrides any userId in data — cannot be spoofed
  });
  return problem;
};

/**
 * getProblems — Retrieves a paginated, filtered list of problems for a user.
 *
 * FILTERING STRATEGY:
 * We build a query object dynamically. Only filters that are explicitly
 * provided are added. This keeps queries efficient — MongoDB won't scan
 * on fields that aren't in the filter.
 *
 * SEARCH:
 * Text search is implemented with a case-insensitive regex on the title
 * field. For a larger dataset, MongoDB text indexes would be more efficient,
 * but regex works well at this scale and is simpler.
 *
 * PAGINATION:
 * skip = (page - 1) * limit
 * We also run countDocuments() to tell the frontend the total number
 * of matching records (needed for pagination controls).
 */
const getProblems = async (userId, queryParams) => {
  const {
    page = 1,
    limit = 20,
    topic,
    difficulty,
    status,
    needsRevision,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = queryParams;

  // Always scope to the authenticated user
  const filter = { userId };

  // Add optional filters only if they were provided
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (status) filter.status = status;
  if (needsRevision !== undefined) filter.needsRevision = needsRevision === 'true';

  // Case-insensitive search on title
  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100 per page
  const skip = (pageNum - 1) * limitNum;

  // Allowed sort fields — prevents sorting on arbitrary fields
  const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'difficulty', 'status', 'dateAttempted'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortDir = sortOrder === 'asc' ? 1 : -1;

  // Run query and count in parallel for efficiency
  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limitNum)
      .lean(), // .lean() returns plain JS objects — faster than Mongoose documents
    Problem.countDocuments(filter),
  ]);

  return {
    problems,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  };
};

/**
 * getProblemById — Retrieves a single problem.
 *
 * OWNERSHIP CHECK:
 * We query with BOTH _id AND userId. If the problem exists but belongs
 * to another user, the query returns null — same as if it doesn't exist.
 * We return 404 in both cases (not 403) to avoid leaking that the
 * resource exists. This is the OWASP-recommended approach.
 */
const getProblemById = async (userId, problemId) => {
  const problem = await Problem.findOne({ _id: problemId, userId }).lean();

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  return problem;
};

/**
 * updateProblem — Updates a problem record.
 *
 * WHY { new: true }:
 * Without this option, findOneAndUpdate returns the document BEFORE
 * the update was applied. { new: true } returns the updated document.
 *
 * WHY { runValidators: true }:
 * By default, Mongoose validators only run on save(). We must
 * explicitly enable them for findOneAndUpdate operations.
 *
 * OWNERSHIP CHECK:
 * Same pattern — both _id and userId must match.
 *
 * WHY WE DELETE userId FROM updateData:
 * Prevents a client from changing the userId of a problem
 * (reassigning it to another user) even if they somehow include
 * userId in the request body.
 */
const updateProblem = async (userId, problemId, updateData) => {
  // Strip userId from update data — cannot be changed
  delete updateData.userId;

  const problem = await Problem.findOneAndUpdate(
    { _id: problemId, userId }, // Ownership check in the query filter
    updateData,
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  return problem;
};

/**
 * deleteProblem — Permanently deletes a problem record.
 *
 * Returns the deleted document so the controller can confirm deletion.
 * Ownership check is built into the query.
 */
const deleteProblem = async (userId, problemId) => {
  const problem = await Problem.findOneAndDelete({ _id: problemId, userId });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  return problem;
};

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};

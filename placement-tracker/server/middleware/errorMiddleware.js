/**
 * Centralised Error Handler
 *
 * WHY CENTRALISED:
 * Without this, every controller would need its own try/catch block
 * with its own res.status().json() call. That's repetitive and
 * inconsistent. With this handler, controllers just call next(error)
 * and the error reaches here in one format.
 *
 * HOW EXPRESS IDENTIFIES THIS AS AN ERROR HANDLER:
 * Express recognises error-handling middleware by its 4-argument
 * signature: (err, req, res, next). It must be registered LAST,
 * after all routes and normal middleware.
 *
 * MONGOOSE ERROR TRANSLATION:
 * Mongoose throws its own error types (ValidationError, CastError, etc.)
 * which are not user-friendly. We translate them here into clean messages.
 *
 * PRODUCTION vs DEVELOPMENT:
 * In development, we include the stack trace for debugging.
 * In production, 500 errors show only a generic message — never
 * expose internal implementation details to end users.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // --- Translate Mongoose CastError ---
  // Occurs when an invalid ObjectId is passed in a URL parameter.
  // e.g., GET /api/problems/not-a-valid-id → Mongoose throws CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
    errors = [];
  }

  // --- Translate Mongoose ValidationError ---
  // Occurs when a document fails schema-level validation on save().
  // We extract the message from each failing field.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = 'Validation failed';
  }

  // --- Translate MongoDB Duplicate Key Error ---
  // Error code 11000 is MongoDB's duplicate key violation.
  // This happens when inserting a document that violates a unique index
  // (e.g., registering with an email that already exists).
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered`;
    errors = [];
  }

  // --- Translate JWT Errors ---
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  // --- Sanitise production 500 errors ---
  // If this is an unexpected programming error (not ApiError with isOperational=true),
  // never expose the internal error message in production.
  if (process.env.NODE_ENV === 'production' && statusCode === 500 && !err.isOperational) {
    message = 'Something went wrong. Please try again later.';
    errors = [];
  }

  // Log unexpected errors for debugging
  if (statusCode === 500) {
    console.error('💥 Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    // Include stack trace only in development — never in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * notFound — 404 handler for unmatched routes.
 *
 * Registered BEFORE the error handler but AFTER all routes.
 * If no route matched, Express falls through to here.
 */
const notFound = (req, res, next) => {
  next(new (require('../utils/ApiError'))(404, `Route not found: ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };

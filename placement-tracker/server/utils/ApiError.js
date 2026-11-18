/**
 * ApiError — Custom error class used throughout the backend.
 *
 * WHY THIS EXISTS:
 * When a service function throws an error (e.g. "Problem not found"),
 * we need that error to carry an HTTP status code so the centralised
 * error handler knows what HTTP status to send in the response.
 *
 * Without this, the error handler would have to guess the status code
 * from the error message or type, which is fragile.
 *
 * USAGE:
 *   throw new ApiError(404, 'Problem not found');
 *   throw new ApiError(400, 'Validation failed', [{ field: 'title', message: 'Required' }]);
 *
 * The error handler in middleware/errorMiddleware.js reads:
 *   err.statusCode — to set the HTTP response status
 *   err.message    — to populate the response message
 *   err.errors     — for field-level validation detail
 *   err.isOperational — to distinguish expected errors from programming bugs
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    // super() sets Error.message, which is what we return to the client
    super(message);

    // HTTP status code — read by the error handler
    this.statusCode = statusCode;

    // Field-level validation errors (array of { field, message } objects)
    this.errors = errors;

    // isOperational = true means this is an expected error (user not found,
    // validation failure, etc.). isOperational = false means a programming
    // bug. In production, only operational errors show their message.
    this.isOperational = true;

    // Capture the stack trace excluding the ApiError constructor itself
    // This makes debugging easier — the stack points to where the error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;

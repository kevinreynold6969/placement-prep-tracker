const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * validate — Middleware factory that runs express-validator rules.
 *
 * HOW IT WORKS:
 * express-validator rules (defined below) run as middleware and
 * collect errors into an internal store. This `validate` function
 * reads those collected errors. If any exist, it creates an ApiError
 * with field-level detail and passes it to next() for the error handler.
 *
 * WHY FIELD-LEVEL ERRORS:
 * The frontend can display errors next to the specific field that
 * failed, rather than a generic "something is wrong" message.
 *
 * IMPORTANT: Server-side validation is the security layer.
 * Frontend validation is for user experience only. A malicious user
 * can bypass frontend validation by sending requests directly.
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new ApiError(400, 'Validation failed', errors));
  }
  next();
};

/**
 * registerRules — Validation rules for POST /api/auth/register
 */
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(), // Converts to lowercase, removes dots in Gmail addresses

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  body('agreedToTerms')
    .equals('true').withMessage('You must accept the Terms and Conditions to register')
    .customSanitizer(() => true), // After validation, convert to boolean true
];

/**
 * loginRules — Validation rules for POST /api/auth/login
 *
 * NOTE: We don't validate password strength on login — only on registration.
 * On login, we just need to know the password is not empty.
 */
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = { validate, registerRules, loginRules };

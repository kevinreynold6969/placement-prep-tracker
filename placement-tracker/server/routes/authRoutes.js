const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, validate } = require('../validators/authValidators');

const router = express.Router();

/**
 * Auth Routes
 *
 * Rate limiting is applied to register and login with the strict authLimiter.
 * Validation rules run before the controller.
 * The validate() middleware collects rule errors and either calls next(error)
 * or next() to proceed to the controller.
 *
 * Route order:
 * authLimiter → validation rules → validate() → controller
 */

// POST /api/auth/register
router.post('/register', authLimiter, registerRules, validate, register);

// POST /api/auth/login
router.post('/login', authLimiter, loginRules, validate, login);

// POST /api/auth/logout
// protect() runs first so we have req.user, though logout tolerates missing tokens
router.post('/logout', logout);

// GET /api/auth/me — returns current user; used by frontend on startup
router.get('/me', protect, getMe);

module.exports = router;

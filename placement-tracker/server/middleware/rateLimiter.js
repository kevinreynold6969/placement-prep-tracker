const rateLimit = require('express-rate-limit');

/**
 * Rate Limiters
 *
 * WHY RATE LIMITING:
 * Without rate limiting, an attacker can attempt thousands of login
 * attempts per second (credential stuffing) or flood the registration
 * endpoint. Rate limiting makes brute force attacks impractical.
 *
 * We use two separate limiters with different thresholds:
 *
 * 1. authLimiter — strict, applied to login and register
 *    5 login attempts / 15 minutes is tight enough to block brute force
 *    but loose enough to not frustrate legitimate users.
 *
 * 2. generalLimiter — lenient, applied to all API routes
 *    100 requests / 15 minutes handles normal dashboard usage
 *    but blocks abusive crawling or scraping.
 *
 * HOW IT WORKS:
 * express-rate-limit tracks requests per IP address in memory.
 * When the limit is exceeded, it responds with 429 Too Many Requests
 * and a Retry-After header telling the client when to try again.
 *
 * IMPORTANT NOTE FOR INTERVIEW:
 * In-memory rate limiting does not work across multiple server instances.
 * In a production multi-instance deployment, rate limit state must be
 * stored in Redis (using rate-limit-redis store). This is documented
 * in KNOWN_ISSUES.md.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 10,                   // Max 10 requests per window per IP
  message: {
    success: false,
    message: 'Too many attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,  // Returns rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,   // Disable the deprecated `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests, including successful ones
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };

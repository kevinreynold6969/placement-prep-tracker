const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * protect — Authentication middleware.
 *
 * Applied to every protected route. Runs BEFORE the controller.
 *
 * WHAT IT DOES:
 * 1. Reads the JWT from the HttpOnly cookie named 'token'.
 * 2. Verifies the JWT signature and checks expiry.
 * 3. Looks up the user in the database to confirm they still exist.
 * 4. Attaches req.user to the request object for downstream use.
 * 5. Calls next() to pass control to the next middleware/controller.
 *
 * WHY STEP 3 (database lookup):
 * A JWT is self-contained — it carries all claims in its payload.
 * We could skip the DB lookup and just trust the token. BUT if a user
 * is deleted after their token is issued, the token remains valid until
 * expiry. The DB lookup catches this case.
 * Trade-off: one extra DB query per protected request. Acceptable.
 *
 * WHY next(error) INSTEAD OF res.send():
 * All error responses must go through the centralised error handler
 * for consistent formatting. Using next(error) ensures that.
 */
const protect = async (req, res, next) => {
  const token = req.cookies.token;

  // No cookie present — user is not authenticated
  if (!token) {
    return next(new ApiError(401, 'Not authenticated. Please log in.'));
  }

  try {
    // jwt.verify() throws if:
    //   - The signature is invalid (token was tampered with)
    //   - The token has expired (exp claim is in the past)
    //   - The secret doesn't match
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm the user still exists in the database
    // .select('-password') ensures the hash is never on req.user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ApiError(401, 'User account no longer exists.'));
    }

    // Attach user to request — available in all subsequent middleware and controllers
    req.user = user;
    next();
  } catch (error) {
    // JsonWebTokenError — token is malformed or signature is invalid
    // TokenExpiredError — token has passed its expiry time
    return next(new ApiError(401, 'Session expired or invalid. Please log in again.'));
  }
};

module.exports = { protect };

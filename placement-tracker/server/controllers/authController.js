const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * generateToken — Creates a signed JWT and sets it as an HttpOnly cookie.
 *
 * WHY A HELPER FUNCTION:
 * Both register and login need to generate a token and set the cookie.
 * Extracting this logic avoids duplication and ensures the cookie
 * configuration is always identical across both endpoints.
 *
 * COOKIE SETTINGS EXPLAINED:
 *   httpOnly: true  — Browser JavaScript cannot access this cookie.
 *                     This is the primary XSS defence for the token.
 *   secure: true (in production) — Cookie only sent over HTTPS.
 *   sameSite: 'strict' — Cookie not sent on cross-site requests.
 *                        This provides CSRF protection without a CSRF token.
 *   maxAge — Duration in milliseconds. Set to 7 days.
 *
 * JWT PAYLOAD:
 * Only contains { id, email }. We deliberately exclude sensitive fields
 * like the password hash. The payload is base64-encoded (not encrypted),
 * so never put sensitive data in a JWT payload.
 */
const generateToken = (res, user) => {
  const payload = { id: user._id, email: user.email };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production only
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

/**
 * register — POST /api/auth/register
 *
 * Flow:
 * 1. Check if email already exists (409 if so)
 * 2. Create new User document (pre-save hook hashes password)
 * 3. Generate JWT and set cookie
 * 4. Return user data (never the password hash)
 *
 * WHY WE CHECK EMAIL BEFORE SAVING:
 * The unique index on email would also catch duplicates, but it throws
 * a MongoDB error (code 11000) which is less informative. The explicit
 * findOne check lets us return a 409 with a clear message.
 * Both checks are in place as defence in depth.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new ApiError(409, 'An account with this email already exists'));
    }

    // Create user — the pre-save hook in User.js hashes the password
    const user = await User.create({ name, email, password });

    // Generate JWT and set HttpOnly cookie
    generateToken(res, user);

    // Return user data — never include the password hash
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * login — POST /api/auth/login
 *
 * Flow:
 * 1. Find user by email (.select('+password') needed because password has select:false)
 * 2. If not found: respond 401 (same message as wrong password — prevents email enumeration)
 * 3. Compare submitted password with stored hash
 * 4. If wrong: respond 401
 * 5. Generate JWT and set cookie
 * 6. Return user data
 *
 * WHY SAME ERROR FOR WRONG EMAIL AND WRONG PASSWORD:
 * If we say "email not found", attackers can discover which emails are
 * registered. "Invalid credentials" for both cases prevents this.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Must use .select('+password') because password has select:false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    // comparePassword is defined as an instance method on the User schema
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    generateToken(res, user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * logout — POST /api/auth/logout
 *
 * Clears the token cookie by setting maxAge to 0 (expires immediately).
 *
 * WHY THIS DOESN'T TRULY INVALIDATE THE JWT:
 * JWTs are stateless — the server doesn't store them. Clearing the cookie
 * removes the token from the browser, so the user can no longer make
 * authenticated requests. However, if someone copied the token before
 * logout, it remains cryptographically valid until its exp claim is reached.
 * This is a documented trade-off (see DECISION_LOG.md DEC-001).
 */
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Set to epoch — immediately expired
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * getMe — GET /api/auth/me
 *
 * Returns the currently authenticated user's profile.
 * Used by the frontend on startup to check if a valid session exists
 * (the AuthContext calls this endpoint to hydrate auth state).
 *
 * req.user is already set by authMiddleware.protect().
 * We don't need a database query here because authMiddleware already
 * fetched and attached the user document.
 */
const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    },
  });
};

module.exports = { register, login, logout, getMe };

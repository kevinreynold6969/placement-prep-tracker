/**
 * server.js — Express application entry point.
 *
 * WHY dotenv.config() FIRST:
 * Any module loaded after this line can safely read process.env.
 * If another module that reads process.env.JWT_SECRET is imported
 * before dotenv.config() runs, it will get undefined.
 * Always call dotenv.config() before any other require that uses env vars.
 */
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);


require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CONNECT TO DATABASE ─────────────────────────────────────────────────────
// ─── MIDDLEWARE STACK ─────────────────────────────────────────────────────────
// Order matters. Each middleware runs in registration order.

/**
 * helmet() — Sets security-related HTTP response headers.
 *
 * Sets: Content-Security-Policy, X-Content-Type-Options (nosniff),
 * X-Frame-Options (DENY), Strict-Transport-Security, Referrer-Policy,
 * X-XSS-Protection (disabled — CSP is better), and others.
 *
 * WHY FIRST: Headers should be set before any response can be sent.
 */
app.use(helmet());

/**
 * cors() — Cross-Origin Resource Sharing configuration.
 *
 * WHY credentials: true:
 * Cookies (including our HttpOnly JWT cookie) are not sent on
 * cross-origin requests by default. credentials: true enables them.
 *
 * WHY NOT origin: '*':
 * Using '*' with credentials: true is rejected by browsers.
 * We must specify the exact frontend origin.
 *
 * WHY ALLOW CREDENTIALS AND SPECIFIC ORIGIN:
 * Our frontend (React on Vite) runs on a different port than the backend
 * in development. Without CORS configuration, the browser would block
 * all requests from the frontend.
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent with requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * express.json() — Parses JSON request bodies.
 *
 * limit: '10kb' — Rejects request bodies larger than 10KB.
 * This prevents large payload attacks (a form of DoS).
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * cookie-parser — Parses cookies from the Cookie header into req.cookies.
 *
 * Without this, req.cookies.token would be undefined and auth would fail.
 */
app.use(cookieParser());

/**
 * express-mongo-sanitize — Removes MongoDB operators from user input.
 *
 * WHY: Prevents NoSQL injection attacks where an attacker submits
 * { "$gt": "" } as a field value to manipulate MongoDB queries.
 * In Node 24 / modern Express, req.query is a getter property, so
 * we sanitize req.body and req.params in-place.
 */
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    mongoSanitize.sanitize(req.params);
  }
  next();
});

/**
 * morgan — HTTP request logger.
 *
 * 'dev' format: "GET /api/auth/me 200 12.345 ms - 128"
 * Only enabled in development to avoid logging sensitive data in production.
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * generalLimiter — Applies rate limiting to all API routes.
 *
 * The stricter authLimiter is applied directly in authRoutes.js.
 */
app.use('/api', generalLimiter);

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint — useful for deployment monitoring
app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;

  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    status: databaseReady ? 'ok' : 'unavailable',
    message: databaseReady ? 'Server and database are ready' : 'Database is not ready',
    database: databaseReady ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
// These MUST be registered after all routes.

// 404 handler — catches requests to undefined routes
app.use(notFound);

// Centralised error handler — catches all errors passed to next(error)
// Must be registered LAST and must have exactly 4 arguments
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error(`❌ Database connection failed; HTTP server was not started: ${error.message}`);
    process.exit(1);
  }
};

// Tests import the app and establish their own database connection.
if (require.main === module) {
  startServer();
}

module.exports = app; // Export for testing with Supertest

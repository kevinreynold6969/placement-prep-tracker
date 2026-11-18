# Backend Logic — Placement Preparation Tracker

Updated 2026-11-17. This guide follows the implementation in `placement-tracker/server`.

## Application setup and middleware

`server.js` loads dotenv before importing application modules. When executed directly, it awaits `connectDB()` before opening the HTTP listener. A connection failure is logged and exits with status 1 without starting HTTP. When required by tests it exports the Express app without starting a listener; the test harness manages its own database connection. Middleware runs in this order: Helmet, credentialed CORS for the configured frontend origin, JSON/urlencoded parsing with a 10 KB limit, cookie parsing, request-body/params sanitisation, development-only Morgan logging, then the general `/api` rate limiter. Routers are mounted before health, 404, and error handlers.

## Registration and login

`routes/authRoutes.js` wires auth rate limits and express-validator rules to the auth controller. `authController.register` checks for an existing email, creates a Mongoose User, then signs a seven-day JWT and sets it as an HttpOnly, SameSite=Strict cookie. The `User` pre-save hook hashes the password with bcryptjs cost 12. The response includes a safe profile only. MongoDB's unique email index handles a registration race after the explicit lookup.

`authController.login` explicitly selects the normally hidden password hash, compares it using `comparePassword`, returns the same 401 for unknown email and wrong password, and sets the same cookie. `getMe` returns the profile attached by `protect`. `logout` expires the cookie; it does not revoke a copied JWT at the server.

## Protected request lifecycle

`middleware/authMiddleware.protect` reads the cookie, verifies the token with `JWT_SECRET`, loads the user, and attaches it to `req.user`. The problem and dashboard routers apply it before their handlers. Validators reject malformed fields/IDs before controllers execute. This is defense in depth: Mongoose schemas also enforce field types, lengths and enums.

Controllers extract HTTP parameters, call a service or model-backed operation, and format the JSON response. Exceptions are passed to `next(error)`. `errorMiddleware` maps validation/cast/duplicate key errors to safe client responses and avoids returning stack traces.

## Problem management

`problemController` passes `req.user.id` rather than trusting an owner ID from the browser. `problemService` builds list filters from allowed query values and applies pagination/sorting. Single-record read/update/delete filters include both problem ID and owner ID; a record belonging to another user behaves as not found. Creation assigns the authenticated owner. The router exposes GET/POST `/api/problems` and GET/PUT/DELETE `/api/problems/:id`.

## Dashboard statistics

`dashboardController` delegates to `dashboardService`. Aggregation pipelines start from the authenticated user's problem records and group by status, difficulty, topic, or date as needed. Results feed summary metrics and chart series. Empty collections therefore produce empty/zero results, not fabricated activity. Dashboard values summarise current problem documents; there is no separate immutable attempt log.

## Validation and errors

`authValidators.js` and `problemValidators.js` use express-validator to normalise and validate input. The schema is a second validation boundary. `ApiError` carries an HTTP status and safe message. The final error middleware handles known Mongoose and duplicate-key errors and falls back to a generic production response for unexpected failures.

## Database connection and operational behavior

`config/db.js` connects Mongoose using `MONGODB_URI` and propagates connection errors to startup. `/api/health` returns HTTP 200 with `database: "connected"` only while Mongoose reports a ready connection; otherwise it returns HTTP 503 with `database: "disconnected"`. This also detects a lost connection after startup. Rate limiting is in-memory and is not shared across multiple server processes.

## Seed and tests

`seeds/seedProblems.js` is an explicit development seed script; it is not run on registration or normal server startup. The custom test runner uses Supertest and mongodb-memory-server. See [TESTING.md](TESTING.md) for execution status; do not claim its cases pass until the command has completed successfully in this checkout.

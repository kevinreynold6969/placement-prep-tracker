# Security — Placement Preparation Tracker

> **Last Updated:** 2026-11-17

Sections marked **[IMPLEMENTED]** describe protections that exist in the codebase.
Sections marked **[RECOMMENDED FUTURE]** describe improvements that are not yet implemented.

---

## Password Hashing [IMPLEMENTED]

Passwords are hashed using **bcryptjs** with a cost factor of 12 before being stored in MongoDB.

**How it works:**
1. User provides password in registration request.
2. `bcryptjs.hash(password, 12)` generates a salted hash.
3. The hash string is stored in `users.password`.
4. The plaintext password is never stored or logged.
5. On login, `bcryptjs.compare(plaintext, hash)` is used — there is no way to "decrypt" a bcrypt hash.

**Why cost factor 12:**
Cost factor 12 means 2^12 = 4096 internal iterations. This makes each hash operation take ~300ms on modern hardware, making brute-force attacks computationally expensive.

**Guarantees:**
- Even if the database is leaked, passwords cannot be recovered without brute-force.
- Unique salt per password: two users with the same password have different hashes.
- Rainbow table attacks are ineffective.

---

## Authentication and Authorisation [IMPLEMENTED]

**Authentication** = verifying who you are (login).
**Authorisation** = verifying what you are allowed to do (ownership checks).

### Authentication Middleware (`authMiddleware.protect`)

Applied to every protected route:
1. Reads the `token` cookie from `req.cookies`.
2. If no cookie: responds 401.
3. `jwt.verify(token, process.env.JWT_SECRET)` — verifies signature and checks expiry.
4. If invalid or expired: responds 401.
5. `User.findById(decoded.id).select('-password')` — confirms the user still exists.
6. If no user found: responds 401.
7. Sets `req.user` and calls `next()`.

The `.select('-password')` projection ensures the password hash is never attached to `req.user`.

### Authorisation (Ownership Checks)

For every problem operation (read, update, delete), the service layer verifies:
```javascript
const problem = await Problem.findOne({ _id: id, userId: req.user.id });
if (!problem) throw new ApiError(404, 'Problem not found');
```

Querying with both `_id` AND `userId` means:
- If the problem exists but belongs to another user, the query returns null → 404 (not 403, to avoid leaking existence of the resource).
- A malicious user cannot access another user's problems by guessing or manipulating IDs.

---

## JWT Handling [IMPLEMENTED]

- JWT secret is stored in `process.env.JWT_SECRET` — never hardcoded.
- Token payload contains: `{ id: user._id, email: user.email }` — only non-sensitive identifiers.
- Token expiry: 7 days (`expiresIn: '7d'`).
- Token is signed with HMAC-SHA256 (HS256 algorithm, `jsonwebtoken` default).
- Token is stored in an **HttpOnly cookie** — not accessible to JavaScript.
- Cookie settings:
  - `httpOnly: true` — no JavaScript access.
  - `secure: true` — HTTPS only (should be set appropriately for the environment).
  - `sameSite: 'strict'` — not sent on cross-origin requests.
  - `maxAge: 7 * 24 * 60 * 60 * 1000` — 7 days in milliseconds.

**JWT Invalidation Trade-off:**
JWT is stateless — there is no server-side session to invalidate. On logout, the cookie is cleared, but the token itself remains cryptographically valid until expiry. This is an accepted limitation of stateless JWT authentication. Mitigation: short expiry (7 days).

**[RECOMMENDED FUTURE]**: Token blacklist (using Redis) or token rotation with refresh tokens would eliminate this window.

---

## Input Validation [IMPLEMENTED]

All incoming data is validated using `express-validator` before it reaches the controller:

- Required fields are checked for presence.
- Strings are trimmed and length-limited.
- Enums are validated against allowed values.
- ObjectIds are validated with `mongoose.isValidObjectId()`.
- URLs are validated with `isURL()`.
- Email addresses are normalised to lowercase.
- Numeric fields are range-checked.

Validation errors are collected and returned as a 400 response with field-level details.

**[RECOMMENDED FUTURE]**: HTML sanitisation (DOMPurify equivalent) if rich text is ever stored.

---

## Protection Against Common Web Vulnerabilities [IMPLEMENTED]

### XSS (Cross-Site Scripting)
- JWT is in an HttpOnly cookie — cannot be stolen by injected JavaScript.
- Helmet sets `Content-Security-Policy` headers to restrict script sources.
- Input is validated and length-limited — extremely large payloads are rejected.
- React's JSX escapes output by default — `{variable}` does not render HTML.

### CSRF (Cross-Site Request Forgery)
- Cookie is set with `SameSite=Strict` — browsers do not send it on cross-origin requests.
- For non-simple requests (PUT, DELETE with JSON), browsers send a preflight OPTIONS request — the CORS configuration only allows the specific frontend origin.

**Note:** `SameSite=Strict` effectively prevents CSRF for most attack scenarios. Additional CSRF tokens are therefore not implemented. If `SameSite` were set to `None`, CSRF tokens would be mandatory.

### SQL/NoSQL Injection
- Mongoose parameterises all queries — there is no raw query string construction.
- Input is validated and type-checked before reaching any database query.
- **[IMPLEMENTED]** `express-mongo-sanitize` strips `$` and `.` characters from request bodies and params to prevent MongoDB operator injection.

### Brute Force
- Rate limiting is applied to both registration and login: 10 requests per 15 minutes per IP, shared by the auth limiter.
- bcrypt's slow hashing further limits the speed of credential stuffing attacks.

---

## Rate Limiting [IMPLEMENTED]

Applied using `express-rate-limit`:

| Endpoint Group | Limit | Window |
|---|---|---|
| POST /api/auth/register and POST /api/auth/login | 10 requests per IP | 15 minutes |
| All /api/* routes | 200 requests per IP | 15 minutes |

When the limit is exceeded, the server responds with 429 and a Retry-After header.

---

## CORS Configuration [IMPLEMENTED]

```javascript
cors({
  origin: process.env.FRONTEND_URL,  // e.g. http://localhost:5173
  credentials: true,                  // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
})
```

**Why not `origin: '*'`:**
Using a wildcard origin with `credentials: true` is not allowed by browsers and would prevent cookie-based authentication from working. The allowed origin must be explicitly set to the frontend URL.

---

## Environment Variables [IMPLEMENTED]

Sensitive configuration is never hardcoded. All secrets are in `.env`:

```
MONGODB_URI=         — MongoDB Atlas connection string
JWT_SECRET=          — Random high-entropy string for JWT signing
NODE_ENV=            — development | production
FRONTEND_URL=        — Allowed CORS origin
PORT=                — Server port
```

`.env` is listed in `.gitignore` and is never committed.
`.env.example` contains placeholder keys with no real values.

---

## User Data Isolation [IMPLEMENTED]

Every database query that returns problem data includes a `userId` filter:
```javascript
Problem.find({ userId: req.user.id })
Problem.findOne({ _id: id, userId: req.user.id })
```

This means:
- A user can never read, update or delete another user's problems.
- Even if a user guesses or obtains another user's problem ID, the ownership check prevents access.
- Dashboard statistics are always scoped to the authenticated user.

---

## Secure Error Handling [IMPLEMENTED]

The centralised error handler in `errorMiddleware.js`:
- Returns the error `message` field in development mode.
- Returns generic "Something went wrong" in production mode (when `NODE_ENV=production`).
- Never exposes stack traces in API responses.
- Never exposes Mongoose error details directly — they are translated into user-friendly messages.
- Mongoose `ValidationError` → 400 with field details.
- Mongoose `CastError` (invalid ObjectId) → 400 "Invalid ID".
- Mongoose duplicate key error (code 11000) → 409 "Email already registered".

---

## Security Headers [IMPLEMENTED]

Helmet.js sets the following headers on every response:
- `Content-Security-Policy` — restricts resource origins.
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing.
- `X-Frame-Options: DENY` — prevents clickjacking.
- `Strict-Transport-Security` — enforces HTTPS.
- `X-XSS-Protection: 0` — disables the broken browser XSS filter (CSP is better).
- `Referrer-Policy: no-referrer` — prevents referrer leakage.

---

## File Upload Security

This application does not implement file uploads. If added in future:
- File type validation (MIME type, not just extension).
- File size limit.
- Virus scanning.
- Storage in a dedicated service (S3), not the server filesystem.

---

## Known Security Limitations

1. **JWT cannot be invalidated**: No token blacklist. A stolen cookie remains valid until expiry. Mitigated by 7-day expiry and HTTPS enforcement.
2. **No email verification**: Users can register with any email address. Mitigation: not critical for a portfolio project; noted as future improvement.
3. **No 2FA**: Not implemented. Future improvement.
4. **Account enumeration on register**: The 409 "Email already registered" response reveals that an email exists. This is a known, accepted trade-off for usability. The login endpoint does NOT distinguish between "user not found" and "wrong password".
5. **No HTTPS enforcement in development**: `secure: true` on the cookie is conditionally set based on `NODE_ENV=production`.

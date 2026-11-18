# Interview Preparation — Placement Preparation Tracker

> **Purpose:** Complete interview preparation guide based on the actual codebase.
> **Last Updated:** 2026-11-17 | Will be updated as implementation progresses.

---

## 1. Two-Minute Project Introduction

> Practice delivering this in exactly 2 minutes.

"I built a full-stack web application called Placement Preparation Tracker. The purpose is to help students like me systematically track their DSA preparation for placement interviews.

The core problem I wanted to solve was that most students track practice in spreadsheets or Notion, which don't give you meaningful analytics. My application lets you record every problem you've attempted — with the platform, topic, difficulty, your solution approach and notes — and then view analytics that show which topics you've covered, which problems need revision, and how your activity has trended over time.

The tech stack is React with Vite on the frontend, Express.js on the backend, MongoDB for the database, and JWT authentication stored in HttpOnly cookies for security.

The backend follows a layered architecture — routes, controllers, services and models — which keeps concerns separated and each layer independently testable. I've documented every major technical decision in the project's docs folder, including why I chose each technology, what alternatives I considered, and what the trade-offs are."

---

## 2. Problem Statement and Motivation

**What problem does it solve?**
Students preparing for placements typically use ad-hoc tools — spreadsheets, sticky notes, Notion pages. These don't:
- Track whether a problem was solved or just attempted.
- Show which topics have insufficient coverage.
- Surface problems that need revision.
- Visualise preparation progress over time.

**Who is it for?**
Engineering students preparing for software placement interviews.

**Why build this vs use an existing tool?**
Existing tools like LeetCode track submissions, not learning context — they don't let you record notes, approach, complexity, or revision status. This tracker is about learning metadata, not just submission results.

---

## 3. Architecture Explanation

```
React SPA → REST API calls → Express.js backend → Mongoose → MongoDB Atlas
```

- The frontend is a Single Page Application. All routing happens client-side via React Router.
- The backend is a stateless REST API. It does not render HTML.
- Communication is JSON over HTTP. The frontend sends requests; the backend responds.
- Authentication is maintained via an HttpOnly cookie containing a JWT.
- The backend verifies the JWT on every protected request using middleware.

**How to draw this in an interview:**
Draw three boxes: Browser, Server, Database. Draw arrows for HTTP requests and database queries. Mention middleware sits between the router and the controller.

---

## 4. Technology Stack and Reasons

| Technology | Why Chosen |
|---|---|
| React | Component model, unidirectional data flow, industry standard |
| Vite | CRA is deprecated; Vite is faster, modern, recommended |
| Tailwind CSS | Utility-first enforces design consistency; no naming problem |
| Axios | Interceptors, instance-based config, cleaner than Fetch |
| Node.js | JavaScript on both sides; large ecosystem; non-blocking I/O |
| Express.js | Minimal, flexible; appropriate for a RESTful API; widely understood |
| MongoDB | Document model suits flexible schema; Atlas avoids local setup |
| Mongoose | Schema validation, type casting, cleaner query API over raw driver |
| JWT | Stateless authentication; no server-side session storage needed |
| bcryptjs | Secure password hashing with salting; works on Windows without compilation |
| Helmet | One-line security headers; CSP, HSTS, clickjacking protection |
| express-rate-limit | Brute force protection on auth endpoints |

---

## 5. Frontend-to-Backend Request Flow

**Scenario: User clicks "Add Problem" and submits the form.**

1. React form validates the input fields locally (required, length, URL format).
2. If valid, calls `api.post('/problems', formData)`.
3. Axios sends `POST http://localhost:5000/api/problems` with JSON body and the JWT cookie (automatically, due to `withCredentials: true`).
4. Express receives the request.
5. `helmet()` sets security headers.
6. `cors()` checks the Origin header.
7. `express.json()` parses the body.
8. `cookie-parser()` parses cookies.
9. The `/api/problems` router matches the route.
10. `rateLimiter` checks the request count for this IP.
11. `authMiddleware.protect()` reads the `token` cookie, verifies the JWT, looks up the user in MongoDB, sets `req.user`.
12. `problemValidators.createProblemRules` validates the body fields.
13. `problemController.createProblem` calls `problemService.createProblem(req.user.id, body)`.
14. The service creates a new Mongoose document, calls `.save()`.
15. MongoDB stores the document.
16. The service returns the saved document.
17. The controller sends `res.status(201).json({ success: true, data: { problem } })`.
18. Axios resolves with the response.
19. React updates local state with the new problem.
20. The user sees the problem appear in the list.

---

## 6. Authentication and Authorisation

**Q: How does login work?**
The user submits email and password. The backend finds the user by email, compares the submitted password against the stored bcrypt hash using `bcryptjs.compare`. If they match, a JWT is generated with `jwt.sign({ id, email }, secret, { expiresIn: '7d' })` and set as an HttpOnly, Secure, SameSite=Strict cookie.

**Q: How does the cookie get sent on subsequent requests?**
The browser automatically sends cookies with every request to the same origin. `withCredentials: true` on the Axios instance and `credentials: true` on the CORS configuration allow this for cross-origin requests in development.

**Q: How are private routes protected on the frontend?**
The `ProtectedRoute` component checks `AuthContext.user`. If no user, it redirects to `/login`. But this is UI-only protection — the backend independently verifies the JWT on every protected API call.

**Q: How are private routes protected on the backend?**
The `authMiddleware.protect` function runs before every protected controller. It reads and verifies the JWT from the cookie. If invalid, it returns 401. The controller never runs.

**Q: How do you prevent one user accessing another's data?**
Every database query that fetches problems uses `{ _id: id, userId: req.user.id }`. Both conditions must match. Even if a user guesses another user's problem ID, the userId filter prevents access.

---

## 7. Database Design

**Q: Why MongoDB over a relational database?**
The problem schema has many optional fields (notes, approach, complexity). In SQL, these would be nullable columns or separate tables. MongoDB allows them to simply be absent from the document. The schema is flexible without requiring migrations.

**Q: How are relationships handled?**
Problems store a `userId` field containing the user's ObjectId. This is a reference-based relationship — MongoDB equivalent of a foreign key.

**Q: Why not embed problems inside the user document?**
An embedded array would grow unboundedly. Pagination would be difficult. The 16MB document limit could be hit. References are the correct approach for one-to-many with large cardinality.

**Q: What indexes do you have?**
- `email` on users (unique) — fast login lookups.
- `userId` on problems — all problem queries filter by this.
- Compound `{ userId, topic }` — topic filter queries.
- Compound `{ userId, status }` — status filter queries.

---

## 8. Important Backend Logic

**Q: How are dashboard statistics calculated?**
Using MongoDB Aggregation Pipelines. For example, to get counts by status: `$match` filters by userId, then `$group` groups by the status field and sums the count. This is a single database round-trip rather than multiple queries.

**Q: Why a service layer?**
The service layer holds business logic that is decoupled from HTTP. The controller handles request parsing and response formatting. The service handles database access and business rules. If I wanted to call the same logic from a cron job, I'd call the service directly.

**Q: How is centralised error handling implemented?**
An error handler middleware with the signature `(err, req, res, next)` is registered last. Any unhandled error from any route reaches it via `next(error)`. It translates Mongoose errors, sets the appropriate HTTP status, and formats the response consistently.

---

## 9. API Explanation

**Q: What REST conventions do you follow?**
- GET for reading, POST for creating, PUT for updating, DELETE for deleting.
- Plural resource names (`/problems`, not `/problem`).
- Specific HTTP status codes (201 for create, 404 for not found, 401 for auth failure, 403 for forbidden).
- Consistent JSON response envelope with `success`, `data`, `message` fields.

**Q: How is pagination implemented?**
Query parameters `page` and `limit` are accepted. The service calculates the skip value as `(page - 1) * limit`, runs `find()` with `.skip().limit()`, and also runs `countDocuments()` for the total. Both results are returned in the response.

---

## 10. Error Handling

**Q: What happens when the database is unavailable?**
On startup, `connectDB()` calls `process.exit(1)` if connection fails. During runtime, Mongoose operations throw errors that propagate to the centralised error handler, which returns a 500 response.

**Q: What happens when a user submits invalid data?**
express-validator runs before the controller and collects all validation failures. If any exist, `next(new ApiError(400, 'Validation failed', errors))` is called. The error handler returns the field-level errors.

**Q: What does the frontend show when a request fails?**
Each page has an `error` state. If the Axios request rejects, the error message from `err.response?.data?.message` (or a fallback) is set in state, and an `<ErrorMessage>` component with a retry button is displayed.

---

## 11. Security

**Q: How are passwords stored?**
Hashed with bcryptjs, cost factor 12. The hash includes a random salt. The plaintext is never stored or logged.

**Q: How are you protected against XSS?**
JWT is in an HttpOnly cookie — inaccessible to JavaScript. React's JSX escapes output. Helmet's Content-Security-Policy restricts script sources.

**Q: How are you protected against CSRF?**
SameSite=Strict cookie attribute — the cookie is not sent on cross-origin requests initiated by other sites.

**Q: How are you protected against NoSQL injection?**
Mongoose parameterises queries. `express-mongo-sanitize` strips MongoDB operators from request bodies.

---

## 12. Performance Considerations

- MongoDB aggregation pipelines perform grouped counting in the database; the service runs its separate aggregations concurrently with `Promise.all`.
- Indexes on `userId`, `{ userId, topic }`, `{ userId, status }` make filtered queries fast.
- Pagination prevents loading all problems at once.
- Axios timeout (10 seconds) prevents indefinite loading.
- Skeleton loaders improve perceived performance.

---

## 13. Challenges Encountered

- **Backend setup could not run from a clean install:** the source imported its runtime and test packages, but `server/package.json` and its lockfile declared none. I added explicit dependencies, regenerated the lockfile, and confirmed the API integration suite runs.
- **Temporary database process under restricted execution:** the first test attempt failed with `spawn EPERM` before assertions ran. Running the same suite with permission to start mongodb-memory-server succeeded (36/36 assertions). This was an execution-environment restriction, not an application test failure.
- **Documentation drift:** existing architecture notes described routes and services that were not in the current source. I reconciled the docs against `App.jsx`, the Express routers, controllers, and services so the interview explanation matches the code.

---

## 14. Technical Trade-offs

| Decision | Trade-off |
|---|---|
| JWT stateless auth | Cannot invalidate tokens before expiry |
| HttpOnly cookies | Requires specific CORS config; harder to debug than headers |
| Context API | Re-renders all consumers on change (acceptable for auth state) |
| MongoDB | No referential integrity enforcement at DB level |
| No TypeScript | Faster to write; less compile-time type safety |
| bcryptjs (pure JS) | Slower than native bcrypt; avoids Windows compilation issues |

---

## 15. Limitations and Future Improvements

| Limitation | Why It Exists | Improvement |
|---|---|---|
| No email verification | Out of scope for portfolio | Add email verification flow |
| JWT cannot be invalidated | Stateless design | Add Redis-based token blacklist or refresh tokens |
| No 2FA | Out of scope | Add TOTP-based 2FA |
| Account enumeration on register | Usability-security trade-off | Show generic "check your email" message |
| No revision history | Schema supports only last revision | Add separate revisions collection |
| No offline support | SPA design | Add service worker + IndexedDB |
| Atlas free tier limits | Portfolio scope | Use paid Atlas tier or self-hosted MongoDB for production |

---

## Potential Interview Questions (Based on Actual Codebase)

### Challenging Questions

**Q: Your JWT has a 7-day expiry. What if a user's account is compromised?**
"You're right — this is a known limitation of stateless JWT. If someone steals the cookie, they can use it for up to 7 days. I've documented this trade-off. The mitigations I have are: short expiry (7 days vs the common 30 days), HTTPS-only cookies, and SameSite=Strict to prevent cross-site cookie use. The proper solution would be refresh tokens with short-lived access tokens (15 minutes), or a Redis-based token blacklist. I deliberately kept it simple for a portfolio project and documented the limitation honestly."

**Q: Why not use TypeScript?**
"The brief specified JavaScript. TypeScript would add compile-time type checking, which is valuable in a team setting or large codebase. For this solo portfolio project, the overhead wasn't justified. That said, I'm familiar with TypeScript and would use it in a production team project."

**Q: Your ownership check returns 404 instead of 403. Why?**
"This is a deliberate security decision. If I return 403, I'm confirming that the resource exists but the user doesn't have access. An attacker could use this to enumerate other users' resource IDs. By returning 404, I give no information about whether the resource exists at all. This is the OWASP-recommended approach for resource-level access control."

**Q: How would you scale this application?**
"Currently it's a single Express instance with Atlas. To scale: I'd put the Express server behind a load balancer with multiple Node instances. JWT is stateless so any instance can verify tokens. MongoDB Atlas supports sharding and replica sets. I'd add Redis for session management and rate limiting across instances. The frontend would be served from a CDN. I'd add monitoring, logging (ELK stack or Datadog), and alerting."

**Q: What would you test next beyond the current integration suite?**
"The current Supertest suite covers authentication, CRUD, ownership isolation, filters, pagination, dashboard aggregation, and health/404 behavior. I would add browser-level tests for registration-to-dashboard navigation, invalid/expired-cookie behavior, database disconnects and malformed JSON, as well as client-side loading/error states. I would also add CI so the server and client checks run on each change."

# Decision Log — Placement Preparation Tracker

> **Purpose:** Records every significant technical decision made during development, with reasoning, alternatives, trade-offs and interview preparation notes.

> **Updated:** 2026-11-17

---

## Decision Template

Each decision follows this structure:
1. Decision ID
2. Date
3. Component/Feature
4. Decision Made
5. Alternatives Considered
6. Why This Approach
7. Why Alternatives Were Rejected
8. Technical Advantages
9. Technical Disadvantages / Trade-offs
10. Impact on Application
11. Potential Interview Questions
12. Interview-Ready Explanation

---

## DEC-001 — JWT Authentication with HttpOnly Cookies

**Date:** 2026-11-17
**Component:** Authentication

### Decision Made
Use JWT (JSON Web Tokens) for authentication, stored in an **HttpOnly, Secure, SameSite=Strict cookie**, not in localStorage.

### Alternatives Considered
1. JWT in localStorage
2. Session-based authentication (server-side sessions + session cookie)
3. JWT in memory (React state only)

### Why This Approach
HttpOnly cookies provide a good balance between security and simplicity. The cookie is sent automatically by the browser on every request, so there is no need for the frontend to manually attach an Authorization header. HttpOnly prevents JavaScript from reading the token, eliminating XSS-based token theft.

### Why Alternatives Were Rejected

**JWT in localStorage**: Accessible to any JavaScript on the page. If an XSS vulnerability exists anywhere on the site, an attacker can steal the token and impersonate the user indefinitely (until expiry). This is a well-documented risk and is discouraged by OWASP.

**Server-side sessions**: Would require the server to store session state (in memory or Redis). This makes the server stateful, complicates horizontal scaling, and adds infrastructure dependency. JWT is stateless — any instance of the server can verify a token without shared state.

**JWT in memory**: Token is lost on page refresh. The user would need to log in every time the page is reloaded. Poor user experience with no security benefit over cookies.

### Technical Advantages
- HttpOnly cookie cannot be read by JavaScript → XSS-resistant token storage.
- SameSite=Strict prevents the cookie from being sent on cross-site requests → CSRF-resistant.
- Stateless — server does not need to store sessions.
- Automatic expiry via JWT `exp` claim.

### Technical Disadvantages / Trade-offs
- JWT tokens cannot be truly invalidated before expiry. If a user is compromised, the token remains valid until the 7-day expiry. Mitigation: Keep expiry short (7 days) and implement logout by clearing the cookie.
- Requires `withCredentials: true` on the Axios instance and proper CORS `credentials: true` + specific origin configuration. `origin: '*'` does not work with credentials.

### Impact on Application
Every protected API route runs `authMiddleware.protect()` which reads and verifies the cookie. The frontend never sees or stores the token — it only knows the user is authenticated via the `/api/auth/me` endpoint response.

### Potential Interview Questions
- "Where is the JWT stored and why?"
- "What is an HttpOnly cookie?"
- "How does SameSite protect against CSRF?"
- "What happens if someone intercepts the cookie?"
- "Can you invalidate a JWT before it expires?"
- "Why not use sessions?"

### Interview-Ready Explanation
"I store the JWT in an HttpOnly cookie rather than localStorage. The reason is that localStorage is accessible to JavaScript, which means an XSS attack could steal the token. An HttpOnly cookie cannot be read by any JavaScript — the browser holds it privately and sends it with requests automatically. I also set SameSite=Strict, which tells the browser not to send the cookie on cross-site requests, defending against CSRF attacks. The trade-off is that JWTs are stateless and cannot be revoked before expiry, but I mitigate this by keeping the token lifetime to 7 days and clearing the cookie on logout."

---

## DEC-002 — MongoDB Atlas (Cloud) Instead of Local MongoDB

**Date:** 2026-11-17
**Component:** Database

### Decision Made
Use MongoDB Atlas free tier (cloud-hosted) instead of a local MongoDB installation.

### Alternatives Considered
1. Local MongoDB installation
2. PostgreSQL (relational)
3. SQLite

### Why This Approach
MongoDB is not installed on the development machine. Atlas provides a free, persistent cloud instance accessible via a connection string. This is also the realistic production setup — portfolio projects demonstrated to interviewers should ideally use a persistent database rather than a local one.

### Why Alternatives Were Rejected
**Local MongoDB**: Not available on the machine. Installing it is possible but adds setup friction.
**PostgreSQL**: The user specified MongoDB. Also, the flexible document model suits the problem schema (many optional fields) better than a rigid relational schema would.
**SQLite**: Not appropriate for a web backend that may serve multiple concurrent requests.

### Technical Advantages
- No local installation required.
- Free tier is sufficient for a portfolio project.
- Atlas provides a web UI for inspecting data.
- Connection string in `.env` — easy to swap environments.

### Technical Disadvantages / Trade-offs
- Requires network connectivity during development.
- Atlas free tier has connection limits and storage limits.
- Atlas free tier is not suitable for production traffic.

### Impact on Application
The connection string is stored in `MONGODB_URI` in `.env`. The `config/db.js` module handles the Mongoose connection with retry logic.

### Potential Interview Questions
- "Why MongoDB over PostgreSQL?"
- "What is a document database?"
- "Why use Atlas instead of local MongoDB?"
- "What are the limitations of MongoDB Atlas free tier?"

### Interview-Ready Explanation
"I used MongoDB Atlas, the cloud-hosted version of MongoDB, primarily because it eliminates the need for local installation and provides a persistent database that works in any environment. The document model is a natural fit because a problem record has many optional fields — notes, approach, complexity — which in a relational database would either be nullable columns or a separate table. MongoDB lets those fields simply be absent from the document when not provided."

---

## DEC-003 — React Context API for State Management (Not Redux)

**Date:** 2026-11-17
**Component:** Frontend — State Management

### Decision Made
Use React Context API with `useReducer` / `useState` for global auth state. No Redux or Zustand.

### Alternatives Considered
1. Redux Toolkit
2. Zustand
3. React Query + Context

### Why This Approach
The only truly global state in this application is the authenticated user. All other state (problem lists, analytics data) is local to individual pages. Context API is built into React, requires no additional dependency, and is straightforward to explain in an interview.

### Why Alternatives Were Rejected
**Redux Toolkit**: Appropriate for applications with complex, deeply shared state across many components. Adds boilerplate (slices, actions, selectors) that would not be justified here. Harder to explain to an interviewer why it was chosen for a simple auth state.
**Zustand**: Lighter than Redux but still an external dependency. Not needed.
**React Query**: Excellent for server state caching. Could be used, but adds complexity and a learning curve without clear benefit for this application size.

### Technical Advantages
- Zero additional dependencies.
- Simple mental model.
- Easy to explain.
- Sufficient for the application's state complexity.

### Technical Disadvantages / Trade-offs
- Context triggers a re-render of all consumers when the context value changes. For auth state (which changes rarely), this is not a problem.
- Not suitable for high-frequency state updates.

### Interview-Ready Explanation
"I used React's built-in Context API for managing authentication state because it's the only state that needs to be shared across the entire component tree. Redux would be overkill here — it's designed for complex, frequently updating global state with many consumers. My global state only contains the user object and a loading flag, which rarely change. Each page manages its own local data-fetching state with useState and useEffect."

---

## DEC-004 — Express.js with Layered Architecture (Routes → Controllers → Services)

**Date:** 2026-11-17
**Component:** Backend Architecture

### Decision Made
Separate backend concerns into Routes, Controllers, Services and Models. No single-file Express app.

### Alternatives Considered
1. Single `server.js` file with all logic
2. MVC only (no service layer)
3. Hexagonal / Clean Architecture

### Why This Approach
A layered architecture separates concerns clearly:
- **Routes** define URL patterns and attach middleware.
- **Controllers** handle HTTP concerns (parsing req, sending res).
- **Services** contain business logic and database access.
- **Models** define data schemas.

This makes the code maintainable and each layer independently testable.

### Why Alternatives Were Rejected
**Single file**: Quickly becomes unmaintainable. Not defensible in an interview.
**Clean/Hexagonal Architecture**: Appropriate for large teams and enterprise systems. Overkill for a portfolio project; would obscure the logic unnecessarily.

### Technical Advantages
- Clear separation of concerns.
- Controllers stay thin (handle req/res only).
- Business logic in services is reusable and testable.
- Easy to navigate and explain.

### Interview-Ready Explanation
"I structured the backend in layers: routes define the URL and middleware, controllers handle the HTTP request and response, and services contain the actual business logic and database queries. The reason for this separation is that if I ever wanted to call the same logic from a different context — say, a cron job or a different route — I can call the service function directly without duplicating code. It also makes each layer independently testable."

---

## DEC-005 — bcryptjs (Cost Factor 12) for Password Hashing

**Date:** 2026-11-17
**Component:** Security — Authentication

### Decision Made
Hash passwords using `bcryptjs` with a cost factor of 12 before storing them.

### Alternatives Considered
1. bcrypt (native C++ bindings)
2. argon2
3. SHA-256 / MD5 (rejected immediately)

### Why This Approach
bcryptjs is a pure JavaScript implementation of bcrypt. It is slower than the native `bcrypt` package but does not require compilation, which makes it more reliable across environments (especially Windows). Cost factor 12 is a good balance between security and performance: hashing takes ~300ms on a modern CPU, which is negligible for a login endpoint but computationally expensive enough to slow brute-force attacks.

### Why Alternatives Were Rejected
**bcrypt (native)**: Requires node-gyp and native build tools. Can cause installation errors on Windows. bcryptjs is functionally identical.
**argon2**: Stronger algorithm, but bcrypt with a sufficient cost factor is entirely adequate for a portfolio project. Argon2 would be a valid choice in a production system.
**SHA-256/MD5**: Never acceptable for passwords. These are fast hash functions designed for data integrity, not password storage. They can be brute-forced rapidly.

### Technical Advantages
- Adaptive: cost factor can be increased as hardware improves.
- Built-in salt: bcrypt generates and stores a random salt in the hash string.
- Resistant to rainbow table attacks.
- Pure JavaScript: no native compilation issues.

### Technical Disadvantages / Trade-offs
- Slower than argon2 at equivalent security levels.
- Pure JS is slower than native bcrypt, but this is imperceptible at a few logins per second.

### Interview-Ready Explanation
"I use bcryptjs with a cost factor of 12 to hash passwords before storing them in MongoDB. bcrypt is a deliberately slow hashing algorithm — it takes about 300ms to hash a password, which is fine for a login endpoint but makes brute-force attacks impractical. The cost factor is adjustable: as hardware improves, I can increase it to maintain security. bcrypt also automatically generates and stores a unique salt, so even if two users have the same password, their hashes will be different. I chose bcryptjs over native bcrypt because it works on Windows without compilation dependencies."

---

## DEC-006 — Axios Instead of Fetch API

**Date:** 2026-11-17
**Component:** Frontend — API Communication

### Decision Made
Use Axios for all HTTP requests from the frontend.

### Alternatives Considered
1. Native Fetch API
2. SWR
3. React Query

### Why This Approach
Axios provides:
- A cleaner instance-based API where `baseURL` and `withCredentials` are set once.
- Interceptors: a single place to handle 401 responses globally.
- Automatic JSON serialisation/deserialisation.
- Better error objects (Axios wraps errors in a consistent structure).

### Why Alternatives Were Rejected
**Fetch**: Can achieve the same results but requires manual handling of `credentials: 'include'` on every call, manual JSON parsing, and manual error detection (fetch does not throw on HTTP 4xx/5xx). Axios is cleaner.
**SWR/React Query**: Excellent for caching and automatic refetching. Would be a valid addition but introduces a dependency and mental model complexity not required for the interview scope.

### Interview-Ready Explanation
"I used Axios over the native Fetch API because I could create a single Axios instance with the base URL and `withCredentials: true` set once, and all requests in the application inherit those settings. I also set up a response interceptor that automatically redirects to the login page if any request returns a 401 — this handles expired sessions gracefully in one place rather than in every component."

---

## DEC-007 — Vite Instead of Create React App

**Date:** 2026-11-17
**Component:** Frontend — Build Tool

### Decision Made
Use Vite as the frontend build tool and dev server.

### Alternatives Considered
1. Create React App (CRA)
2. Next.js

### Why This Approach
Vite is the current industry standard for React projects. It uses native ES modules in development, resulting in near-instant dev server startup. HMR (Hot Module Replacement) is significantly faster than CRA's Webpack-based approach.

### Why Alternatives Were Rejected
**CRA**: Deprecated by the React team. Slow development server. No longer recommended.
**Next.js**: Adds SSR/SSG complexity that is not needed here. The application is a client-rendered SPA with its own API backend — Next.js would add framework overhead without benefit.

### Interview-Ready Explanation
"I used Vite instead of Create React App because CRA is deprecated and significantly slower. Vite uses native ES modules during development so the dev server starts almost instantly regardless of project size. For a portfolio project that is a pure SPA, there's no reason to use Next.js — it adds SSR complexity without providing value when you already have a separate Express backend."

---

## DEC-008 — Tailwind CSS for Styling

**Date:** 2026-11-17
**Component:** Frontend — Styling

### Decision Made
Use Tailwind CSS utility classes for all styling. No CSS modules or styled-components.

### Alternatives Considered
1. Plain CSS / CSS Modules
2. Styled Components
3. MUI / Ant Design / shadcn/ui

### Why This Approach
Tailwind enforces a design system (spacing scale, colour palette, typography scale) through its utility classes. This results in visually consistent UI with less design decision overhead. It also eliminates the naming problem in CSS (what to call a class) and scoping issues.

### Why Alternatives Were Rejected
**Plain CSS**: Requires naming every class, managing scope, and making every spacing/colour decision manually.
**Styled Components**: CSS-in-JS with a runtime cost. Adds a build step and makes the JSX harder to read.
**MUI/Ant Design**: Component libraries constrain visual design heavily. The landing page needs to look custom, not like a Material Design clone.

### Interview-Ready Explanation
"Tailwind CSS is a utility-first framework that provides a constrained design system through class names. Rather than writing custom CSS, I compose styles directly in the JSX using utility classes like `px-4 py-2 bg-blue-600 text-white rounded-lg`. This keeps everything in one place and enforces consistency — every spacing and colour choice comes from Tailwind's scale, so the UI looks coherent without a lot of design effort."

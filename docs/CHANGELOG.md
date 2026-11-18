# Changelog — Placement Preparation Tracker

> Records significant changes chronologically.

## 2026-11-17 — MongoDB startup sequencing and readiness

### Changed
- Await MongoDB connection before opening the HTTP listener; startup logs a clear database error and exits with code 1 on failure.
- `/api/health` now returns 200 only when Mongoose is connected and 503 when disconnected.
- Expanded the backend integration runner to exercise both health states.

### Verification
- `npm test`: all 37 backend assertions passed.
- Startup smoke check with an invalid MongoDB URI: logged the failure, exited with code 1, and did not start HTTP.

## 2026-11-17 — Dependency, setup and documentation reconciliation

### Changed
- Declared the backend runtime and test dependencies in `placement-tracker/server/package.json` and regenerated its npm lockfile so clean installs can run the API and test runner.
- Added `placement-tracker/README.md`, a server `.env.example`, and an app-level `.gitignore` for setup, configuration, dependencies, and build output.
- Reconciled project overview, architecture, backend/frontend logic, known issues, and testing docs with the routes and components that actually exist.
- Replaced prior unverified backend test claims with current execution results.

### Verification
- Client `npm run build`: passed; Vite emitted a large JavaScript chunk advisory.
- Server `npm test`: all 36 integration assertions passed using mongodb-memory-server.
- Server `npm audit`: zero vulnerabilities reported.

---

## 2026-11-17 — Phase 4: Dashboard & Core Features

### Added
- Integrated Dashboard Workspace (`src/pages/DashboardPage.jsx`) supporting 4 interactive views:
  - **Overview Tab**: Real metric cards (Total, Solved, Attempted, Revision Backlog) + 18-topic curriculum coverage + difficulty distribution.
  - **All Problems Tab**: Multi-facet filter bar, problem table with pagination, inline quick-revision toggle, inspect modal, edit modal, and delete confirmation modal.
  - **Revision Backlog Tab**: Dedicated view enforcing `needsRevision=true` filter, displaying candidate mistake notes and one-click "Mark as Revised" action.
  - **Progress Analytics Tab**: Recharts visualisations derived strictly from MongoDB aggregation pipelines.
- Problem Management Components (`src/components/problems/`):
  - `ProblemModal.jsx` — Controlled form supporting title, platform, URL, 18 DSA categories, difficulty, status, Big-O complexities, approach, and notes.
  - `ProblemDetailModal.jsx` — In-depth viewer for solution approach, Big-O analysis, and previous mistakes.
  - `DeleteConfirmModal.jsx` — Confirmation modal preventing accidental deletions.
  - `ProblemFilterBar.jsx` — Instant title search, 18-topic dropdown, difficulty selector, status selector, sort order, and filter reset.
  - `ProblemTable.jsx` — Responsive table with inline badges and pagination controls.
- Dashboard Components (`src/components/dashboard/`):
  - `MetricCard.jsx` — Stat card with trend styling.
  - `TopicProgress.jsx` — 18-topic progress bars with an objective, transparent Focus Area calculation (>=3 attempts with <50% solved ratio).
  - `AnalyticsCharts.jsx` — Recharts BarChart (topics), PieChart (difficulty), and LineChart (velocity over past 30 days) with honest zero-data handling.
- Reusable Common Components (`src/components/common/`):
  - `StatusBadge.jsx` — Styled difficulty and status badges.
  - `EmptyState.jsx` — Contextual empty state with action triggers.

### Verification
- Full client build passed cleanly with Recharts in 1.57s (`vite build`).
- Backend integration test suite re-verified (36/36 tests passing).

---

## 2026-11-17 — Phase 3: Public Frontend & Authentication Client

### Added
- Vite + React 19 frontend architecture in `placement-tracker/client`:
  - `src/api/axios.js` — Configured Axios client with `withCredentials: true` and 10s timeout.
  - `src/contexts/AuthContext.jsx` — React Context provider executing session hydration via `/api/auth/me`, login, register, and logout.
  - `src/components/common/ProtectedRoute.jsx` — Route guard preventing unauthenticated access to `/dashboard` with loading spinner.
  - `src/components/common/Navbar.jsx` — Responsive navigation bar supporting active route indicators, mobile drawer, and session awareness.
  - `src/components/common/Footer.jsx` — Professional footer with genuine architectural labels and legal links.
  - `src/pages/LandingPage.jsx` — SaaS-style landing page inspired by Linear and Vercel:
    - Hero with interactive dashboard preview mockup.
    - Problem Breakdown (why spreadsheets fail for placement season).
    - 6 core capability feature cards with Lucide icons.
    - 18 canonical DSA categories grid showcase.
    - 4-layer backend architecture breakdown.
  - `src/pages/LoginPage.jsx` — Controlled form with real-time validation, field-level errors, disabled submit state, and session redirect.
  - `src/pages/RegisterPage.jsx` — Candidate registration form with mandatory checkbox acknowledging Terms and Privacy Policy.
  - `src/pages/TermsPage.jsx` — Standalone Terms & Conditions detailing acceptable use, content ownership, and interview placement disclaimer.
  - `src/pages/PrivacyPage.jsx` — Standalone Privacy Policy detailing bcryptjs salt hashing, single HttpOnly cookie usage, and honest security limitations.
  - `src/pages/DashboardPage.jsx` — Authenticated dashboard hydration verifying live backend metrics and empty-state handling.
  - `src/App.jsx` — React Router 7 `BrowserRouter` setup with public routes and a protected dashboard.
  - Tailwind CSS v4 configured with `@tailwindcss/vite` plugin and custom dark typography styling.

### Verification
- Production build executed (`vite build`) successfully producing zero errors or warnings (1.88s).
- Full integration with Express backend via Vite `/api` proxy.

---

## 2026-11-17 — Phase 2: Backend Foundation & Integration Testing

### Added
- Complete Express REST API backend in `placement-tracker/server`:
  - `server.js` — Main entry point with full middleware stack, conditional initialization, and health endpoint.
  - `config/db.js` — Mongoose database connection module with graceful exit handling.
  - `models/User.js` — User model with bcryptjs pre-save hashing (cost factor 12) and `select: false` on password.
  - `models/Problem.js` — Problem model with 18 DSA topic categories, 6 platforms, 3 difficulty tiers, 4 statuses, and compound indexes.
  - `middleware/authMiddleware.js` — JWT verification reading from HttpOnly cookies and database user verification.
  - `middleware/errorMiddleware.js` — Centralised error handler translating Mongoose CastError, ValidationError, and duplicate key 11000.
  - `middleware/rateLimiter.js` — Dual rate limiters (strict for auth endpoints, general for API routes).
  - `validators/authValidators.js` & `validators/problemValidators.js` — Server-side express-validator rules and sanitisation.
  - `controllers/authController.js`, `problemController.js`, `dashboardController.js` — Thin HTTP controllers.
  - `services/problemService.js` — Business logic with ownership enforcement on every query.
  - `services/dashboardService.js` — MongoDB aggregation pipelines for dashboard cards and analytics charts.
  - `seeds/seedProblems.js` — Explicit test data seeding script with user isolation.
  - `tests/runTests.js` — Automated integration test suite running on an in-memory MongoDB server.

### Bugs Discovered & Fixed During Phase 2
1. Modern Express / Node 24 `req.query` getter conflict in `express-mongo-sanitize`: resolved with in-place object sanitisation.
2. Mongoose 8 async pre-save hook callback issue: updated pre-save hook to return standard Promise.
3. Mongoose `findOneAndUpdate` deprecation: updated to `{ returnDocument: 'after' }`.

### Test Results
- **36/36 integration tests executed and passed (100% pass rate)**.
- Documented in `docs/TESTING.md`.

---

## 2026-11-17 — Phase 1: Planning and Documentation

### Added
- `/docs` folder created with 12 documentation files:
  - `PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `DATABASE_DESIGN.md`, `API_DOCUMENTATION.md`, `BACKEND_LOGIC.md`, `FRONTEND_LOGIC.md`, `SECURITY.md`, `TESTING.md`, `INTERVIEW_PREPARATION.md`, `CHANGELOG.md`, `KNOWN_ISSUES.md`.

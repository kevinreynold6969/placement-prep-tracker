# Frontend Logic — Placement Preparation Tracker

Updated 2026-11-17; reflects `placement-tracker/client/src`.

## Structure

- `App.jsx`: public routes (`/`, `/login`, `/register`, `/terms`, `/privacy`) and protected `/dashboard` route.
- `contexts/AuthContext.jsx`: session hydration and shared `user`, `loading`, `login`, `register`, and `logout` state/actions.
- `api/axios.js`: shared API client; `/api` by default, cookie credentials included, 10-second timeout.
- `pages/`: public pages and the dashboard page.
- `components/common/`: navigation, footer, protected route, loading skeletons, empty states, and status badges.
- `components/problems/`: problem form/detail/delete modals, filters, and paginated table.
- `components/dashboard/`: metrics, topic progress, and Recharts visualisations.

## Session and protected route flow

On mount, `AuthProvider` calls `GET /auth/me`. The browser sends the HttpOnly cookie; JavaScript never reads the token itself. Until that request settles, `loading` is true. `ProtectedRoute` displays its loading state while authentication is unresolved, renders the dashboard for an authenticated user, and redirects an unauthenticated visitor to `/login`.

Login and registration submit to the real API. On success, AuthContext stores only the returned user profile in React state; the browser manages the cookie. Logout calls the API to clear the cookie and clears the client user state even if the request fails.

## API and dashboard data

The Axios instance uses `VITE_API_URL` when supplied and `/api` otherwise. The Vite development server forwards `/api` to port 5000. Axios errors are caught by pages/components and shown as inline error states with retry where provided.

`DashboardPage` loads `/dashboard/stats`, `/dashboard/analytics`, and paginated `/problems` data for the selected tab/filter. Problem create/edit/delete and revision actions call the corresponding API and refresh affected data. Search/filter/page values are sent to the backend, so the UI operates on the user's persisted records rather than an in-memory mock dataset.

## Forms and states

Login and registration use controlled form inputs and display server/client validation feedback. Registration requires acceptance of the Terms and Privacy Policy. Problem modals collect the problem fields and submit to the API. Dashboard views distinguish loading, failed requests, no matching filtered records, and a genuinely empty account.

## State management

React Context is used only for authentication, the state shared by navigation and protected routing. Dashboard and form state is local to the relevant component. This keeps the project understandable without introducing a global cache/store dependency. Data is refetched after mutations; there is no realtime subscription or offline cache.

## Styling

Tailwind CSS 4 is configured through the Vite plugin. The actual visual system uses dark zinc surfaces with emerald accents, responsive layouts, and Lucide icons. Recharts supplies the analytics charts. `npm run build` confirms the current client bundles successfully; it reports a large-chunk advisory documented in [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

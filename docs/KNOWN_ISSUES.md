# Known Issues and Limitations

Updated 2026-11-17. This file describes issues found by reviewing the current source and running available verification commands.

## Open issues

### KI-001 — JWT cannot be revoked server-side

**Severity:** Medium. Logout clears the browser cookie, but a copied token remains valid until its seven-day expiry. A token store/rotation strategy would be needed for immediate revocation.

### KI-002 — No email verification or account recovery

The app accepts an email address without proving ownership and has no password reset flow. Add email delivery and verified account lifecycle before relying on it for important accounts.

### KI-003 — Revision state is not an event history

The problem document stores a revision flag and `revisedAt`; it does not retain a sequence of revision attempts. Analytics therefore describe current records rather than a complete study history.

### KI-004 — Single large client bundle

`npm run build` succeeds, but Vite reports a minified JavaScript chunk above 500 kB. Route-level lazy loading or chart code splitting would reduce initial download size.

### KI-005 — Backend dependency installation / test verification

**Resolved 2026-11-17.** The original server manifest and lockfile lacked dependency declarations. Dependencies and a regenerated lockfile are now present; `npm test` passed all 36 cases and `npm audit` reported zero vulnerabilities. Previous unverified test counts were replaced with this run's results.

### KI-006 — Deployment configuration is not included

The app needs a MongoDB URI, a high-entropy JWT secret, an allowed frontend origin and HTTPS in production. No hosting, monitoring, CI, or database backup configuration is included.

## Security limitations

- Registration distinguishes an existing email with a conflict response, which permits account enumeration.
- Cookie-based authentication relies on `SameSite=Strict` and an allowlisted CORS origin; there is no separate CSRF token.
- Rate limits use the process's in-memory store, so limits are not shared across multiple server instances.
- No two-factor authentication, structured security monitoring, or automated dependency audit is configured.

## Resolved during this work

- **Backend packages absent from manifest/lockfile:** added runtime and test dependency declarations, regenerated `package-lock.json`, and ran the backend integration suite successfully (37 current assertions).
- **Database startup and health readiness:** startup now awaits MongoDB before listening and exits non-zero on connection failure. `/api/health` reports 503 while Mongoose is disconnected; verified by integration tests and an invalid-URI startup smoke check.

Update this list when an issue is fixed or discovered. Keep verification status in [TESTING.md](TESTING.md).

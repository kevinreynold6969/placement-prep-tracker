# Testing — Placement Preparation Tracker

Updated 2026-11-17. Results below refer only to commands executed during this work; older unverified totals have been removed.

## Current verification

| Check | Result | Notes |
|---|---|---|
| Client production build (`npm run build`, `placement-tracker/client`) | Passed | Vite completed; it emitted a warning for a JavaScript chunk over 500 kB. |
| Backend integration suite (`npm test`, `placement-tracker/server`) | Passed: 37/37 | Includes health responses for connected and disconnected MongoDB states. |
| Startup failure smoke check (`MONGODB_URI=invalid://not-mongodb npm start`) | Passed | Process logged that HTTP was not started and exited with code 1. |
| Server dependency audit (`npm audit`) | Passed: 0 vulnerabilities | Executed after dependency installation. |

## Existing backend suite

The custom runner in `server/tests/runTests.js` starts `mongodb-memory-server`, connects Mongoose, and sends requests through the Express app with Supertest. Its source covers registration/login/logout, protected access, problem CRUD and ownership isolation, filters/pagination, dashboard aggregation, and health/404 behavior. The test source—not this description—defines the exact current coverage. Run it with:

```sh
cd placement-tracker/server
npm install
npm test
```

`mongodb-memory-server` may need to download a MongoDB binary the first time it runs. A successful client build does not verify production database connectivity or browser-level interaction.

## Results log

| Date | Command | Result |
|---|---|---|
| 2026-11-17 | `npm run build` in `placement-tracker/client` | Passed; Vite warned about a chunk over 500 kB. |
| 2026-11-17 | `npm install` in `placement-tracker/server` | Passed; populated runtime and test dependencies and updated the lockfile. |
| 2026-11-17 | `npm test` in `placement-tracker/server` | Passed: all 37 authentication, problem ownership/CRUD, dashboard/analytics, health and error-route assertions. |
| 2026-11-17 | Invalid `MONGODB_URI` startup smoke check | Passed: clear failure message; process exit code 1; HTTP listener was not started. |
| 2026-11-17 | `npm audit` in `placement-tracker/server` | Passed: 0 vulnerabilities reported. |

Record detailed test IDs and outcomes here only after execution. Include failures and the environment used; never infer passing results from test code existing.

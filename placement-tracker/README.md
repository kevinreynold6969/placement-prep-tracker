# Placement Preparation Tracker

A React/Vite client and Express/MongoDB API for recording DSA practice. Architecture and implementation notes are in the repository's [`docs`](../docs/PROJECT_OVERVIEW.md) folder.

## Prerequisites

- Node.js 20+ (the current project was checked with Node 24)
- MongoDB local instance or Atlas database

## Local setup

1. Configure the API:

   ```powershell
   cd server
   npm install
   Copy-Item .env.example .env
   ```

   Set `MONGODB_URI` and a long random `JWT_SECRET` in `server/.env`.

2. Start the API in one terminal:

   ```powershell
   cd server
   npm run dev
   ```

3. Start the client in another terminal:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

   Open the Vite URL (normally `http://localhost:5173`). The Vite proxy forwards `/api` to `http://localhost:5000`.

For a split-origin deployment, set `FRONTEND_URL` on the server and `VITE_API_URL` at client build time. Serve production traffic over HTTPS so the auth cookie's Secure flag is active.

## Commands

| Directory | Command | Purpose |
|---|---|---|
| `server` | `npm test` | Run API integration tests using mongodb-memory-server |
| `server` | `npm start` | Start API |
| `server` | `npm run seed` | Explicitly load development seed data; not run automatically |
| `client` | `npm run build` | Create production client bundle |
| `client` | `npm run dev` | Start Vite development server |

Tests start a temporary MongoDB binary; first execution may require network access to obtain it. Do not run the seed script against a database containing personal data.

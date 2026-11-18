import axios from 'axios';

/**
 * Axios instance configured for cookie-based authentication.
 *
 * WHY withCredentials: true:
 * In cookie-based JWT authentication, the token is stored in an HttpOnly cookie.
 * By default, browsers do not include cookies in cross-origin XMLHttpRequests.
 * Setting withCredentials: true instructs the browser to include the auth cookie
 * with every single HTTP request automatically.
 *
 * BASE URL:
 * In development, requests to /api are proxied by Vite to http://localhost:5000.
 * In production, VITE_API_URL can be set to the backend host.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 10000, // 10-second request timeout prevents hanging promises
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

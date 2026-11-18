import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute Component
 *
 * Prevents unauthenticated users from accessing private routes (e.g. /dashboard).
 *
 * KEY DEFENSIVE PRACTICES:
 * 1. Checks `loading` state first: During initial session hydration (/auth/me),
 *    we must not prematurely redirect the user to /login before the network
 *    check completes.
 * 2. `replace: true`: Replaces the current history entry so the browser's back
 *    button doesn't get trapped in a redirect loop.
 * 3. Preserves `location.state.from`: Allows redirecting the user back to their
 *    intended page after successful login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-muted">
        <div className="w-12 h-12 rounded-xl border-2 border-punch-500/20 border-t-punch-500 animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wide animate-pulse">Verifying authenticated session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

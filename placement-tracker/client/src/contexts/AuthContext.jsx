import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/**
 * AuthProvider ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Global Authentication State
 *
 * WHY REACT CONTEXT:
 * Authentication is the primary cross-cutting state in the application.
 * Routing guards (ProtectedRoute) and navigation bars need to know
 * whether a user is logged in without prop drilling.
 * Using Context API avoids heavy external dependencies like Redux
 * while keeping state management clean and explainable during an interview.
 *
 * SESSION HYDRATION:
 * Because the JWT is stored in an HttpOnly cookie, client JavaScript cannot
 * read the token directly from document.cookie. On application mount, the
 * provider sends a GET /api/auth/me request. If a valid cookie exists,
 * the server responds with the authenticated user profile. If not, the
 * user state is set to null.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const res = await api.get('/auth/me');
        if (isMounted && res.data?.data?.user) {
          setUser(res.data.data.user);
        }
      } catch (err) {
        // A 401 on initial boot simply means no session cookie is present
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.data?.user) {
      setUser(res.data.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, agreedToTerms) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      agreedToTerms: agreedToTerms ? 'true' : 'false',
    });
    if (res.data?.data?.user) {
      setUser(res.data.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

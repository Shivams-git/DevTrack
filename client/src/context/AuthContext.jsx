import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = '/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('devtrack_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('devtrack_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate existing token on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          setUser(json.data);
          localStorage.setItem('devtrack_user', JSON.stringify(json.data));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        // Fallback or network error: keep local session
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Login failed. Please check your credentials.');
      }

      const { user: userData, token: userToken } = json.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('devtrack_token', userToken);
      localStorage.setItem('devtrack_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async ({ name, email, password, role, team, bio }) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, team, bio }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Registration failed.');
      }

      const { user: userData, token: userToken } = json.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('devtrack_token', userToken);
      localStorage.setItem('devtrack_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('devtrack_token');
    localStorage.removeItem('devtrack_user');
  };

  const demoLogin = async (demoEmail = 'alex@devtrack.dev') => {
    return login(demoEmail, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        error,
        login,
        register,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';

async function parseResponse(res) {
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    json = { error: text || `Server error (${res.status})` };
  }
  return { ok: res.ok, status: res.status, data: json };
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Load saved multi-account sessions
  const [sessions, setSessions] = useState(() => {
    try {
      const savedSessions = localStorage.getItem('devtrack_sessions');
      if (savedSessions) {
        return JSON.parse(savedSessions);
      }
      // Migrate legacy single session if present
      const legacyUser = localStorage.getItem('devtrack_user');
      const legacyToken = localStorage.getItem('devtrack_token');
      if (legacyUser && legacyToken) {
        const initial = [{ user: JSON.parse(legacyUser), token: legacyToken }];
        localStorage.setItem('devtrack_sessions', JSON.stringify(initial));
        return initial;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Current active user & token
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
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return sessionStorage.getItem('devtrack_guest_session') === 'true';
    } catch {
      return false;
    }
  });

  const applyUserTheme = (userData) => {
    const themeToApply = (userData && userData.theme) || 'tokyo';
    localStorage.setItem('devtrack_theme', themeToApply);
    window.dispatchEvent(new CustomEvent('devtrack_theme_change', { detail: themeToApply }));
  };

  const enterGuestMode = (isTest = false) => {
    try {
      sessionStorage.setItem('devtrack_guest_session', 'true');
    } catch {}
    setIsGuest(true);
    if (typeof isTest === 'boolean') {
      localStorage.setItem('devtrack_test_mode', isTest ? 'true' : 'false');
    }
  };

  // Synchronize helper
  const syncSessionStorage = (newSessions, activeUser, activeToken) => {
    setSessions(newSessions);
    localStorage.setItem('devtrack_sessions', JSON.stringify(newSessions));
    if (activeUser && activeToken) {
      setUser(activeUser);
      setToken(activeToken);
      localStorage.setItem('devtrack_user', JSON.stringify(activeUser));
      localStorage.setItem('devtrack_token', activeToken);
      setIsGuest(false);
      try {
        sessionStorage.removeItem('devtrack_guest_session');
      } catch {}
      applyUserTheme(activeUser);
    } else {
      setUser(null);
      setToken(null);
      localStorage.removeItem('devtrack_user');
      localStorage.removeItem('devtrack_token');
    }
  };

  // Validate active token on mount
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

        const { ok, data: json } = await parseResponse(res);

        if (ok && json.data) {
          const updatedUser = json.data;
          setUser(updatedUser);
          localStorage.setItem('devtrack_user', JSON.stringify(updatedUser));
          applyUserTheme(updatedUser);

          // Update active user in sessions list
          setSessions((prev) => {
            const next = prev.map((s) =>
              (s.user._id && s.user._id === updatedUser._id) || s.user.email === updatedUser.email
                ? { ...s, user: updatedUser }
                : s
            );
            localStorage.setItem('devtrack_sessions', JSON.stringify(next));
            return next;
          });
        }
      } catch (err) {
        // Network error: preserve local session
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const isSameUser = (u1, target) => {
    if (!u1 || !target) return false;
    const targetId = typeof target === 'string' ? target : (target._id || target.id);
    const targetEmail = typeof target === 'string' ? target : target.email;
    const u1Id = u1._id || u1.id;
    const u1Email = u1.email;

    if (targetId && u1Id && String(u1Id) === String(targetId)) return true;
    if (targetEmail && u1Email && u1Email.toLowerCase() === targetEmail.toLowerCase()) return true;
    if (typeof target === 'string') {
      if (u1Id && String(u1Id) === target) return true;
      if (u1Email && u1Email.toLowerCase() === target.toLowerCase()) return true;
    }
    return false;
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const { ok, data: json } = await parseResponse(res);
      if (!ok) {
        throw new Error(json.error || 'Login failed. Please check your credentials.');
      }

      const { user: userData, token: userToken } = json.data;

      // Add to sessions or update existing
      setSessions((prev) => {
        const filtered = prev.filter((s) => !isSameUser(s.user, userData));
        const nextSessions = [...filtered, { user: userData, token: userToken }];
        syncSessionStorage(nextSessions, userData, userToken);
        return nextSessions;
      });

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

      const { ok, data: json } = await parseResponse(res);
      if (!ok) {
        throw new Error(json.error || 'Registration failed.');
      }

      const { user: userData, token: userToken } = json.data;

      setSessions((prev) => {
        const filtered = prev.filter((s) => !isSameUser(s.user, userData));
        const nextSessions = [...filtered, { user: userData, token: userToken }];
        syncSessionStorage(nextSessions, userData, userToken);
        return nextSessions;
      });

      localStorage.setItem('devtrack_test_mode', 'false');

      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const switchAccount = (userIdOrEmail) => {
    const targetSession = sessions.find((s) => isSameUser(s.user, userIdOrEmail));

    if (targetSession) {
      setUser(targetSession.user);
      setToken(targetSession.token);
      localStorage.setItem('devtrack_user', JSON.stringify(targetSession.user));
      localStorage.setItem('devtrack_token', targetSession.token);
      setIsGuest(false);
      try {
        sessionStorage.removeItem('devtrack_guest_session');
      } catch {}
      applyUserTheme(targetSession.user);
      return { success: true, user: targetSession.user };
    }
    return { success: false, error: 'Session not found' };
  };

  const logout = (userIdOrEmail) => {
    const targetId = userIdOrEmail || (user ? (user._id || user.email) : null);
    if (!targetId) return;

    try {
      sessionStorage.removeItem('devtrack_guest_session');
    } catch {}
    setIsGuest(false);

    const remaining = sessions.filter((s) => !isSameUser(s.user, targetId));

    // If logging out active profile, switch to next available profile or clear
    const isActiveBeingRemoved = user && isSameUser(user, targetId);

    if (isActiveBeingRemoved) {
      if (remaining.length > 0) {
        const next = remaining[0];
        syncSessionStorage(remaining, next.user, next.token);
      } else {
        syncSessionStorage([], null, null);
      }
    } else {
      setSessions(remaining);
      localStorage.setItem('devtrack_sessions', JSON.stringify(remaining));
    }
  };

  const logoutAll = () => {
    try {
      sessionStorage.removeItem('devtrack_guest_session');
    } catch {}
    setIsGuest(false);
    syncSessionStorage([], null, null);
  };

  const demoLogin = async (demoEmail = 'alex@devtrack.dev') => {
    return login(demoEmail, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessions,
        otherProfiles: sessions.filter((s) => user && !isSameUser(s.user, user)),
        isAuthenticated: Boolean(user && token),
        isGuest,
        enterGuestMode,
        loading,
        error,
        login,
        register,
        switchAccount,
        logout,
        logoutAll,
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

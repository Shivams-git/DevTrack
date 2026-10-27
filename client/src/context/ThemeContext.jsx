import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  // --- LIGHT THEMES (At the top) ---
  {
    id: 'tokyo',
    name: 'Tokyo Lilac',
    type: 'light',
    tagline: 'Pastel violet & neon grape',
    preview: { bg: '#faf5ff', card: '#ffffff', accent: '#9333ea', sidebar: '#ffffff' },
    vars: {
      '--theme-bg': '#faf5ff',
      '--theme-surface': '#ffffff',
      '--theme-surface-alt': '#f5f3ff',
      '--theme-surface-hover': '#ede9fe',
      '--theme-sidebar': '#ffffff',
      '--theme-sidebar-border': '#e9d5ff',
      '--theme-sidebar-text': '#270d47',
      '--theme-sidebar-muted': '#7e52a0',
      '--theme-sidebar-surface': '#faf5ff',
      '--theme-sidebar-surface-border': '#e9d5ff',
      '--theme-sidebar-hover': '#f5f3ff',
      '--theme-header': 'rgba(255, 255, 255, 0.95)',
      '--theme-border': '#e9d5ff',
      '--theme-border-strong': '#d8b4fe',
      '--theme-primary': '#9333ea',
      '--theme-primary-hover': '#7e22ce',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 4px 14px rgba(147, 51, 234, 0.35)',
      '--theme-primary-subtle': 'rgba(147, 51, 234, 0.12)',
      '--theme-accent': '#ec4899',
      '--theme-text': '#270d47',
      '--theme-text-muted': '#7e52a0',
    },
  },
  {
    id: 'studio',
    name: 'Clean Studio',
    type: 'light',
    tagline: 'Crisp minimal & sapphire blue',
    preview: { bg: '#f1f4f9', card: '#ffffff', accent: '#2563eb', sidebar: '#ffffff' },
    vars: {
      '--theme-bg': '#f1f4f9',
      '--theme-surface': '#ffffff',
      '--theme-surface-alt': '#f8fafc',
      '--theme-surface-hover': '#f1f5f9',
      '--theme-sidebar': '#ffffff',
      '--theme-sidebar-border': '#e2e8f0',
      '--theme-sidebar-text': '#0f172a',
      '--theme-sidebar-muted': '#64748b',
      '--theme-sidebar-surface': '#f8fafc',
      '--theme-sidebar-surface-border': '#e2e8f0',
      '--theme-sidebar-hover': '#f1f5f9',
      '--theme-header': 'rgba(255, 255, 255, 0.95)',
      '--theme-border': '#cbd5e1',
      '--theme-border-strong': '#94a3b8',
      '--theme-primary': '#2563eb',
      '--theme-primary-hover': '#1d4ed8',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 4px 14px rgba(37, 99, 235, 0.3)',
      '--theme-primary-subtle': 'rgba(37, 99, 235, 0.1)',
      '--theme-accent': '#06b6d4',
      '--theme-text': '#0f172a',
      '--theme-text-muted': '#64748b',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    type: 'light',
    tagline: 'Warm sunlit & tangerine glow',
    preview: { bg: '#fef3c7', card: '#ffffff', accent: '#ea580c', sidebar: '#fffbeb' },
    vars: {
      '--theme-bg': '#fef3c7',
      '--theme-surface': '#ffffff',
      '--theme-surface-alt': '#fffbeb',
      '--theme-surface-hover': '#fef3c7',
      '--theme-sidebar': '#fffbeb',
      '--theme-sidebar-border': '#fed7aa',
      '--theme-sidebar-text': '#291507',
      '--theme-sidebar-muted': '#8a5a36',
      '--theme-sidebar-surface': '#ffffff',
      '--theme-sidebar-surface-border': '#fed7aa',
      '--theme-sidebar-hover': '#fef3c7',
      '--theme-header': 'rgba(255, 255, 255, 0.95)',
      '--theme-border': '#fdba74',
      '--theme-border-strong': '#fb923c',
      '--theme-primary': '#ea580c',
      '--theme-primary-hover': '#c2410c',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 4px 14px rgba(234, 88, 12, 0.35)',
      '--theme-primary-subtle': 'rgba(234, 88, 12, 0.12)',
      '--theme-accent': '#d97706',
      '--theme-text': '#291507',
      '--theme-text-muted': '#785135',
    },
  },

  // --- DARK THEMES (Below) ---
  {
    id: 'midnight',
    name: 'Midnight Slate',
    type: 'dark',
    tagline: 'Deep black & bright slate navy',
    preview: { bg: '#060913', card: '#141d2e', accent: '#6366f1', sidebar: '#04060c' },
    vars: {
      '--theme-bg': '#060913',
      '--theme-surface': '#141d2e',
      '--theme-surface-alt': '#1b283d',
      '--theme-surface-hover': '#23324d',
      '--theme-sidebar': '#04060c',
      '--theme-sidebar-border': '#1f2c42',
      '--theme-sidebar-text': '#f8fafc',
      '--theme-sidebar-muted': '#94a3b8',
      '--theme-sidebar-surface': '#0c1322',
      '--theme-sidebar-surface-border': '#1f2c42',
      '--theme-sidebar-hover': '#141d2e',
      '--theme-header': 'rgba(20, 29, 46, 0.95)',
      '--theme-border': '#283954',
      '--theme-border-strong': '#3b5278',
      '--theme-primary': '#6366f1',
      '--theme-primary-hover': '#4f46e5',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 0 20px rgba(99, 102, 241, 0.45)',
      '--theme-primary-subtle': 'rgba(99, 102, 241, 0.2)',
      '--theme-accent': '#38bdf8',
      '--theme-text': '#f8fafc',
      '--theme-text-muted': '#94a3b8',
    },
  },
  {
    id: 'obsidian',
    name: 'Obsidian Cyber',
    type: 'dark',
    tagline: 'Pitch void & glowing neon cyan',
    preview: { bg: '#030407', card: '#121927', accent: '#00f0ff', sidebar: '#020204' },
    vars: {
      '--theme-bg': '#030407',
      '--theme-surface': '#121927',
      '--theme-surface-alt': '#192336',
      '--theme-surface-hover': '#222f46',
      '--theme-sidebar': '#020204',
      '--theme-sidebar-border': '#1a273b',
      '--theme-sidebar-text': '#f0f6fc',
      '--theme-sidebar-muted': '#8b949e',
      '--theme-sidebar-surface': '#0b101b',
      '--theme-sidebar-surface-border': '#1a273b',
      '--theme-sidebar-hover': '#121927',
      '--theme-header': 'rgba(18, 25, 39, 0.95)',
      '--theme-border': '#253952',
      '--theme-border-strong': '#00f0ff',
      '--theme-primary': '#00f0ff',
      '--theme-primary-hover': '#38bdf8',
      '--theme-primary-text': '#030407',
      '--theme-primary-glow': '0 0 22px rgba(0, 240, 255, 0.55)',
      '--theme-primary-subtle': 'rgba(0, 240, 255, 0.18)',
      '--theme-accent': '#10b981',
      '--theme-text': '#f0f6fc',
      '--theme-text-muted': '#8b949e',
    },
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    type: 'dark',
    tagline: 'Deep arctic night & bright pine teal',
    preview: { bg: '#030a0d', card: '#0e262d', accent: '#10b981', sidebar: '#020608' },
    vars: {
      '--theme-bg': '#030a0d',
      '--theme-surface': '#0e262d',
      '--theme-surface-alt': '#15363e',
      '--theme-surface-hover': '#1e4852',
      '--theme-sidebar': '#020608',
      '--theme-sidebar-border': '#153138',
      '--theme-sidebar-text': '#ecfdf5',
      '--theme-sidebar-muted': '#a7f3d0',
      '--theme-sidebar-surface': '#07181d',
      '--theme-sidebar-surface-border': '#153138',
      '--theme-sidebar-hover': '#0e262d',
      '--theme-header': 'rgba(14, 38, 45, 0.95)',
      '--theme-border': '#1d4a54',
      '--theme-border-strong': '#10b981',
      '--theme-primary': '#10b981',
      '--theme-primary-hover': '#059669',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 0 20px rgba(16, 185, 129, 0.45)',
      '--theme-primary-subtle': 'rgba(16, 185, 129, 0.2)',
      '--theme-accent': '#2dd4bf',
      '--theme-text': '#ecfdf5',
      '--theme-text-muted': '#a7f3d0',
    },
  },
  {
    id: 'rosewood',
    name: 'Rosewood Luxury',
    type: 'dark',
    tagline: 'Velvet black & bright ruby crimson',
    preview: { bg: '#0a0306', card: '#200c18', accent: '#f43f5e', sidebar: '#060204' },
    vars: {
      '--theme-bg': '#0a0306',
      '--theme-surface': '#200c18',
      '--theme-surface-alt': '#2c1221',
      '--theme-surface-hover': '#3d1a2f',
      '--theme-sidebar': '#060204',
      '--theme-sidebar-border': '#2d1020',
      '--theme-sidebar-text': '#fff1f2',
      '--theme-sidebar-muted': '#fda4af',
      '--theme-sidebar-surface': '#14060f',
      '--theme-sidebar-surface-border': '#2d1020',
      '--theme-sidebar-hover': '#200c18',
      '--theme-header': 'rgba(32, 12, 24, 0.95)',
      '--theme-border': '#461c32',
      '--theme-border-strong': '#f43f5e',
      '--theme-primary': '#f43f5e',
      '--theme-primary-hover': '#e11d48',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 0 22px rgba(244, 63, 94, 0.5)',
      '--theme-primary-subtle': 'rgba(244, 63, 94, 0.2)',
      '--theme-accent': '#fbbf24',
      '--theme-text': '#fff1f2',
      '--theme-text-muted': '#fda4af',
    },
  },
];

import { api } from '../services/api.js';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('devtrack_theme') || 'tokyo';
  });

  const activeTheme =
    THEMES.find((t) => t.id === currentThemeId) ||
    THEMES.find((t) => t.id === 'tokyo') ||
    THEMES[0];

  // Listen for login/profile theme sync events
  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail && THEMES.some((t) => t.id === e.detail)) {
        setCurrentThemeId(e.detail);
        localStorage.setItem('devtrack_theme', e.detail);
      }
    };
    window.addEventListener('devtrack_theme_change', handleThemeChange);
    return () => window.removeEventListener('devtrack_theme_change', handleThemeChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('devtrack_theme', activeTheme.id);
    const root = document.documentElement;

    // Apply all theme CSS variables
    Object.entries(activeTheme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Backward-compatible variable aliases
    root.style.setProperty('--bg-main', activeTheme.vars['--theme-bg']);
    root.style.setProperty('--bg-surface', activeTheme.vars['--theme-surface']);
    root.style.setProperty('--bg-surface-hover', activeTheme.vars['--theme-surface-hover']);
    root.style.setProperty('--bg-sidebar', activeTheme.vars['--theme-sidebar']);
    root.style.setProperty('--text-main', activeTheme.vars['--theme-text']);
    root.style.setProperty('--text-muted', activeTheme.vars['--theme-text-muted']);
    root.style.setProperty('--border-subtle', activeTheme.vars['--theme-border']);
    root.style.setProperty('--border-muted', activeTheme.vars['--theme-border-strong']);

    // Set document background color directly
    document.body.style.backgroundColor = activeTheme.vars['--theme-bg'];
    document.body.style.color = activeTheme.vars['--theme-text'];

    if (activeTheme.type === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [activeTheme]);

  const setTheme = async (themeId) => {
    if (!THEMES.some((t) => t.id === themeId)) return;

    // 1. Instantly update active theme state & local storage
    setCurrentThemeId(themeId);
    localStorage.setItem('devtrack_theme', themeId);

    // 2. Synchronously update locally cached user and sessions so reload never loses it
    const token = localStorage.getItem('devtrack_token');
    const rawUser = localStorage.getItem('devtrack_user');
    if (rawUser) {
      try {
        const userObj = JSON.parse(rawUser);
        userObj.theme = themeId;
        localStorage.setItem('devtrack_user', JSON.stringify(userObj));
      } catch {}
    }
    const rawSessions = localStorage.getItem('devtrack_sessions');
    if (rawSessions) {
      try {
        const sessionsObj = JSON.parse(rawSessions);
        const updatedSessions = sessionsObj.map((s) =>
          s.token === token || !token ? { ...s, user: { ...s.user, theme: themeId } } : s
        );
        localStorage.setItem('devtrack_sessions', JSON.stringify(updatedSessions));
      } catch {}
    }

    // 3. Dispatch event immediately so all contexts and UI update synchronously
    window.dispatchEvent(new CustomEvent('devtrack_theme_change', { detail: themeId }));

    // 4. Immediately persist to database for this user
    if (token) {
      try {
        const res = await api.updateTheme(themeId);
        if (res?.data) {
          localStorage.setItem('devtrack_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn('Could not persist theme to server:', err.message);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

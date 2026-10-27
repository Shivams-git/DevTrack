import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Slate',
    type: 'dark',
    tagline: 'Deep slate & electric violet',
    preview: { bg: '#0b0f19', card: '#111827', accent: '#6366f1' },
    vars: {
      '--bg-main': '#0b0f19',
      '--bg-surface': '#111827',
      '--bg-surface-hover': '#1e293b',
      '--bg-sidebar': '#080c14',
      '--border-subtle': '#1f293d',
      '--border-muted': '#334155',
      '--text-main': '#f8fafc',
      '--text-muted': '#94a3b8',
      '--accent-color': '#6366f1',
      '--accent-hover': '#4f46e5',
      '--accent-subtle': 'rgba(99, 102, 241, 0.15)',
    },
  },
  {
    id: 'obsidian',
    name: 'Obsidian Cyber',
    type: 'dark',
    tagline: 'Pure pitch & neon cyan',
    preview: { bg: '#09090b', card: '#18181b', accent: '#06b6d4' },
    vars: {
      '--bg-main': '#09090b',
      '--bg-surface': '#18181b',
      '--bg-surface-hover': '#27272a',
      '--bg-sidebar': '#050507',
      '--border-subtle': '#27272a',
      '--border-muted': '#3f3f46',
      '--text-main': '#fafafa',
      '--text-muted': '#a1a1aa',
      '--accent-color': '#06b6d4',
      '--accent-hover': '#0891b2',
      '--accent-subtle': 'rgba(6, 182, 212, 0.15)',
    },
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    type: 'dark',
    tagline: 'Arctic blue & emerald glow',
    preview: { bg: '#0d1520', card: '#152232', accent: '#10b981' },
    vars: {
      '--bg-main': '#0d1520',
      '--bg-surface': '#152232',
      '--bg-surface-hover': '#1e3247',
      '--bg-sidebar': '#080e16',
      '--border-subtle': '#1e3247',
      '--border-muted': '#2c4764',
      '--text-main': '#f0fdf4',
      '--text-muted': '#94a3b8',
      '--accent-color': '#10b981',
      '--accent-hover': '#059669',
      '--accent-subtle': 'rgba(16, 185, 129, 0.15)',
    },
  },
  {
    id: 'rosewood',
    name: 'Rosewood Luxury',
    type: 'dark',
    tagline: 'Mahogany velvet & rose gold',
    preview: { bg: '#120c14', card: '#1d1421', accent: '#f43f5e' },
    vars: {
      '--bg-main': '#120c14',
      '--bg-surface': '#1d1421',
      '--bg-surface-hover': '#2e1e35',
      '--bg-sidebar': '#0c080d',
      '--border-subtle': '#2e1e35',
      '--border-muted': '#4a3055',
      '--text-main': '#fff1f2',
      '--text-muted': '#fda4af',
      '--accent-color': '#f43f5e',
      '--accent-hover': '#e11d48',
      '--accent-subtle': 'rgba(244, 63, 94, 0.15)',
    },
  },
  {
    id: 'studio',
    name: 'Clean Studio',
    type: 'light',
    tagline: 'Crisp minimal & royal indigo',
    preview: { bg: '#f8fafc', card: '#ffffff', accent: '#4f46e5' },
    vars: {
      '--bg-main': '#f8fafc',
      '--bg-surface': '#ffffff',
      '--bg-surface-hover': '#f1f5f9',
      '--bg-sidebar': '#0f172a',
      '--border-subtle': '#e2e8f0',
      '--border-muted': '#cbd5e1',
      '--text-main': '#0f172a',
      '--text-muted': '#64748b',
      '--accent-color': '#4f46e5',
      '--accent-hover': '#4338ca',
      '--accent-subtle': 'rgba(79, 70, 229, 0.1)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    type: 'light',
    tagline: 'Warm ivory & tangerine glow',
    preview: { bg: '#faf7f2', card: '#ffffff', accent: '#ea580c' },
    vars: {
      '--bg-main': '#faf7f2',
      '--bg-surface': '#ffffff',
      '--bg-surface-hover': '#f4ede4',
      '--bg-sidebar': '#1c1917',
      '--border-subtle': '#ede5d8',
      '--border-muted': '#d6c7b2',
      '--text-main': '#1c1917',
      '--text-muted': '#78716c',
      '--accent-color': '#ea580c',
      '--accent-hover': '#c2410c',
      '--accent-subtle': 'rgba(234, 88, 12, 0.1)',
    },
  },
  {
    id: 'tokyo',
    name: 'Tokyo Lilac',
    type: 'light',
    tagline: 'Pastel violet & energetic grape',
    preview: { bg: '#f5f3ff', card: '#ffffff', accent: '#9333ea' },
    vars: {
      '--bg-main': '#f5f3ff',
      '--bg-surface': '#ffffff',
      '--bg-surface-hover': '#ede9fe',
      '--bg-sidebar': '#1e1b4b',
      '--border-subtle': '#e9d5ff',
      '--border-muted': '#d8b4fe',
      '--text-main': '#1e1b4b',
      '--text-muted': '#6b7280',
      '--accent-color': '#9333ea',
      '--accent-hover': '#7e22ce',
      '--accent-subtle': 'rgba(147, 51, 234, 0.1)',
    },
  },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('devtrack_theme') || 'studio';
  });

  const activeTheme = THEMES.find((t) => t.id === currentThemeId) || THEMES[4]; // Default Clean Studio

  useEffect(() => {
    localStorage.setItem('devtrack_theme', activeTheme.id);
    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(activeTheme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    if (activeTheme.type === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [activeTheme]);

  const setTheme = (themeId) => {
    if (THEMES.some((t) => t.id === themeId)) {
      setCurrentThemeId(themeId);
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

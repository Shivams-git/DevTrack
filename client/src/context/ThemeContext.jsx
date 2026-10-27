import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Slate',
    type: 'dark',
    tagline: 'Deep slate & electric violet',
    preview: { bg: '#0a0f1d', card: '#111928', accent: '#6366f1' },
    vars: {
      '--theme-bg': '#0a0f1d',
      '--theme-surface': '#111928',
      '--theme-surface-alt': '#172133',
      '--theme-surface-hover': '#1e293b',
      '--theme-sidebar': '#080c16',
      '--theme-sidebar-border': '#1c283d',
      '--theme-header': 'rgba(17, 25, 40, 0.9)',
      '--theme-border': '#1e293b',
      '--theme-border-strong': '#334155',
      '--theme-primary': '#6366f1',
      '--theme-primary-hover': '#4f46e5',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 0 20px rgba(99, 102, 241, 0.4)',
      '--theme-primary-subtle': 'rgba(99, 102, 241, 0.15)',
      '--theme-accent': '#38bdf8',
      '--theme-text': '#f8fafc',
      '--theme-text-muted': '#94a3b8',
    },
  },
  {
    id: 'obsidian',
    name: 'Obsidian Cyber',
    type: 'dark',
    tagline: 'Pure pitch & neon cyan',
    preview: { bg: '#050508', card: '#0d1117', accent: '#00f0ff' },
    vars: {
      '--theme-bg': '#050508',
      '--theme-surface': '#0d1117',
      '--theme-surface-alt': '#161b22',
      '--theme-surface-hover': '#1f242c',
      '--theme-sidebar': '#030305',
      '--theme-sidebar-border': '#1b2838',
      '--theme-header': 'rgba(13, 17, 23, 0.9)',
      '--theme-border': '#1f2d3d',
      '--theme-border-strong': '#00f0ff',
      '--theme-primary': '#00f0ff',
      '--theme-primary-hover': '#38bdf8',
      '--theme-primary-text': '#050508',
      '--theme-primary-glow': '0 0 22px rgba(0, 240, 255, 0.5)',
      '--theme-primary-subtle': 'rgba(0, 240, 255, 0.15)',
      '--theme-accent': '#10b981',
      '--theme-text': '#f0f6fc',
      '--theme-text-muted': '#8b949e',
    },
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    type: 'dark',
    tagline: 'Arctic blue & emerald glow',
    preview: { bg: '#061214', card: '#0a1d20', accent: '#10b981' },
    vars: {
      '--theme-bg': '#061214',
      '--theme-surface': '#0a1d20',
      '--theme-surface-alt': '#0f292d',
      '--theme-surface-hover': '#15373d',
      '--theme-sidebar': '#040b0d',
      '--theme-sidebar-border': '#123339',
      '--theme-header': 'rgba(10, 29, 32, 0.9)',
      '--theme-border': '#163f46',
      '--theme-border-strong': '#10b981',
      '--theme-primary': '#10b981',
      '--theme-primary-hover': '#059669',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 0 20px rgba(16, 185, 129, 0.4)',
      '--theme-primary-subtle': 'rgba(16, 185, 129, 0.15)',
      '--theme-accent': '#2dd4bf',
      '--theme-text': '#ecfdf5',
      '--theme-text-muted': '#a7f3d0',
    },
  },
  {
    id: 'rosewood',
    name: 'Rosewood Luxury',
    type: 'dark',
    tagline: 'Mahogany velvet & ruby crimson',
    preview: { bg: '#12070c', card: '#1d0d15', accent: '#f43f5e' },
    vars: {
      '--theme-bg': '#12070c',
      '--theme-surface': '#1d0d15',
      '--theme-surface-alt': '#27131d',
      '--theme-surface-hover': '#361b29',
      '--theme-sidebar': '#0b0407',
      '--theme-sidebar-border': '#341423',
      '--theme-header': 'rgba(29, 13, 21, 0.9)',
      '--theme-border': '#3a1727',
      '--theme-border-strong': '#f43f5e',
      '--theme-primary': '#f43f5e',
      '--theme-primary-hover': '#e11d48',
      '--theme-primary-text': '#ffffff',
      '--theme-primary-glow': '0 0 22px rgba(244, 63, 94, 0.45)',
      '--theme-primary-subtle': 'rgba(244, 63, 94, 0.15)',
      '--theme-accent': '#fbbf24',
      '--theme-text': '#fff1f2',
      '--theme-text-muted': '#fda4af',
    },
  },
  {
    id: 'studio',
    name: 'Clean Studio',
    type: 'light',
    tagline: 'Crisp minimal & sapphire blue',
    preview: { bg: '#f4f6fa', card: '#ffffff', accent: '#2563eb' },
    vars: {
      '--theme-bg': '#f4f6fa',
      '--theme-surface': '#ffffff',
      '--theme-surface-alt': '#f8fafc',
      '--theme-surface-hover': '#f1f5f9',
      '--theme-sidebar': '#0f172a',
      '--theme-sidebar-border': '#1e293b',
      '--theme-header': 'rgba(255, 255, 255, 0.92)',
      '--theme-border': '#e2e8f0',
      '--theme-border-strong': '#cbd5e1',
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
    preview: { bg: '#fefce8', card: '#ffffff', accent: '#ea580c' },
    vars: {
      '--theme-bg': '#fefce8',
      '--theme-surface': '#ffffff',
      '--theme-surface-alt': '#fffbeb',
      '--theme-surface-hover': '#fef3c7',
      '--theme-sidebar': '#1c130b',
      '--theme-sidebar-border': '#3a2214',
      '--theme-header': 'rgba(255, 255, 255, 0.92)',
      '--theme-border': '#fed7aa',
      '--theme-border-strong': '#fdba74',
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
  {
    id: 'tokyo',
    name: 'Tokyo Lilac',
    type: 'light',
    tagline: 'Pastel violet & neon grape',
    preview: { bg: '#faf5ff', card: '#ffffff', accent: '#9333ea' },
    vars: {
      '--theme-bg': '#faf5ff',
      '--theme-surface': '#ffffff',
      '--theme-surface-alt': '#f5f3ff',
      '--theme-surface-hover': '#ede9fe',
      '--theme-sidebar': '#1b0e33',
      '--theme-sidebar-border': '#361b62',
      '--theme-header': 'rgba(255, 255, 255, 0.92)',
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
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('devtrack_theme') || 'studio';
  });

  const activeTheme = THEMES.find((t) => t.id === currentThemeId) || THEMES[4];

  useEffect(() => {
    localStorage.setItem('devtrack_theme', activeTheme.id);
    const root = document.documentElement;

    // Apply all CSS variables
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

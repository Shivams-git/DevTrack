import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Palette, Check, Sun, Moon, ChevronDown } from 'lucide-react';

export function ThemeSelector() {
  const { activeTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border theme-border theme-card text-xs font-semibold text-[var(--theme-text)] hover:theme-surface-alt transition-all shadow-2xs"
        title="Choose Theme (7 themes available)"
      >
        <span
          className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20 flex-shrink-0"
          style={{ backgroundColor: activeTheme.preview.accent }}
        />
        <span className="hidden md:inline">{activeTheme.name}</span>
        {activeTheme.type === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
        <ChevronDown className="w-3 h-3 text-[var(--theme-text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 theme-card rounded-xl shadow-2xl border theme-border py-1.5 z-[100] animate-scale-in">
          <div className="px-3 py-1.5 border-b theme-border flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
              Select Theme (7 Themes)
            </span>
            <Palette className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
          </div>

          <div className="py-1 max-h-72 overflow-y-auto">
            {themes.map((theme) => {
              const isSelected = theme.id === activeTheme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between gap-2.5 text-left text-xs transition-colors ${
                    isSelected
                      ? 'theme-surface-alt font-semibold text-[var(--theme-primary)]'
                      : 'hover:theme-surface-alt text-[var(--theme-text)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Visual palette circle showing bg, surface, accent */}
                    <div
                      className="w-5 h-5 rounded-full border theme-border flex items-center justify-center p-0.5"
                      style={{ backgroundColor: theme.preview.bg }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-xs"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--theme-text)]">{theme.name}</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase font-bold ${
                            theme.type === 'dark'
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-amber-100/80 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {theme.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--theme-text-muted)] font-normal">
                        {theme.tagline}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[var(--theme-primary)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

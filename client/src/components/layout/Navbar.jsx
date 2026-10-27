import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Menu, RotateCw, PanelLeftOpen, LogIn, LogOut, User, Shield } from 'lucide-react';
import { useIssues } from '../../context/IssueContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ThemeSelector } from '../common/ThemeSelector.jsx';

const routeTitles = {
  '/': 'Overview Dashboard',
  '/board': 'Kanban Board',
  '/issues': 'All Issues',
  '/insights': 'Insights & Analytics',
  '/activity': 'Activity History',
};

export function Navbar({ onMenuClick, isSidebarVisible, onToggleSidebar }) {
  const { searchQuery, setSearchQuery, openCreateModal, triggerRefresh, loading } = useIssues();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeTitles[location.pathname] || 'Developer Workflow';

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 theme-header backdrop-blur-md border-b theme-border px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors">
      <div className="flex items-center gap-2.5">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop unhide sidebar button (visible only when sidebar is collapsed) */}
        {!isSidebarVisible && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex items-center gap-1.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:theme-accent-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Show Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-base sm:text-lg font-bold text-[var(--theme-text)] leading-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-1 max-w-xl justify-end">
        {/* Global Search */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues (DEV-001, bug...)"
            className="w-full pl-8 pr-3 py-1.5 text-xs theme-surface-alt text-[var(--theme-text)] rounded-lg border theme-border focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Theme Selector Dropdown (7 Themes) */}
        <ThemeSelector />

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Refresh data"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin theme-accent-text' : ''}`} />
        </button>

        {/* Quick New Issue Action */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold theme-btn-primary shadow-sm active:scale-95 transition-all flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Issue</span>
        </button>

        {/* User Profile / Auth Button */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-xl border theme-border hover:theme-surface-alt transition-colors"
              title={`${user.name} (${user.email})`}
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                alt={user.name}
                className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700"
              />
              <span className="text-xs font-semibold hidden md:inline max-w-[100px] truncate text-[var(--theme-text)]">
                {user.name.split(' ')[0]}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 theme-card rounded-xl shadow-2xl border theme-border py-2 z-50 animate-scale-in">
                <div className="px-3.5 py-2 border-b theme-border">
                  <div className="font-bold text-xs truncate text-[var(--theme-text)]">{user.name}</div>
                  <div className="text-[10px] text-[var(--theme-text-muted)] truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded theme-subtle-badge">
                      {user.role || 'developer'}
                    </span>
                    {user.team && (
                      <span className="text-[9px] text-[var(--theme-text-muted)] truncate">
                        &bull; {user.team}
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-[var(--theme-text)] hover:theme-surface-alt transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border theme-border hover:theme-subtle-badge text-[var(--theme-text)] transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}

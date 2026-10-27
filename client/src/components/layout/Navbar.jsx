import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Menu,
  RotateCw,
  PanelLeftOpen,
  LogIn,
  LogOut,
  User,
  Users,
  UserPlus,
  Check,
  X,
  FlaskConical,
} from 'lucide-react';
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
  const {
    searchQuery,
    setSearchQuery,
    openCreateModal,
    triggerRefresh,
    loading,
    addToast,
    testMode,
    toggleTestMode,
  } = useIssues();
  const { user, sessions, isAuthenticated, otherProfiles, switchAccount, logout, logoutAll } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeTitles[location.pathname] || 'Developer Workflow';

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut to focus search with Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSwitch = (userIdOrEmail) => {
    const res = switchAccount(userIdOrEmail);
    setUserMenuOpen(false);
    if (res.success && res.user) {
      if (addToast) {
        addToast(`Switched active profile to ${res.user.name}`, 'info');
      }
      triggerRefresh();
    }
  };

  const handleLogoutCurrent = () => {
    setUserMenuOpen(false);
    logout();
    if (otherProfiles.length === 0) {
      navigate('/login');
    }
  };

  const handleLogoutAll = () => {
    setUserMenuOpen(false);
    logoutAll();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 theme-header backdrop-blur-md border-b theme-border px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-colors">
      {/* Left: Page Title & Sidebar Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
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
          <h1 className="text-base sm:text-lg font-bold text-[var(--theme-text)] leading-tight whitespace-nowrap">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Prominent, Expanded Global Search */}
      <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-xl mx-2 sm:mx-4">
        <div className="relative w-full group">
          <Search className="w-4 h-4 text-[var(--theme-text-muted)] group-focus-within:text-[var(--theme-primary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues by key, title, status, or tag... (DEV-001)"
            className="w-full pl-10 pr-16 py-2 h-9 sm:h-10 text-xs sm:text-sm theme-surface-alt text-[var(--theme-text)] rounded-xl border theme-border hover:border-[var(--theme-border-strong)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:outline-none transition-all shadow-xs placeholder:text-[var(--theme-text-muted)]/75"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="w-5 h-5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-md border theme-border bg-[var(--theme-surface)] text-[var(--theme-text-muted)] shadow-2xs pointer-events-none">
                Ctrl K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions Cluster */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Test Mode Toggle Pill */}
        <button
          onClick={() => toggleTestMode()}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            testMode
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'border-dashed theme-border text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:theme-surface-alt'
          }`}
          title={
            testMode
              ? 'Test Mode is ACTIVE: Viewing sample demo issues. Click to return to your personal workspace.'
              : 'Test Mode is OFF: Viewing your personal workspace. Click to load sample demo issues.'
          }
        >
          <FlaskConical className={`w-3.5 h-3.5 ${testMode ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden xl:inline">
            {testMode ? 'Test Mode: ON' : 'Test Mode'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              testMode ? 'bg-amber-500 ring-2 ring-amber-400/40' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        </button>

        {/* Theme Selector Dropdown (7 Themes) */}
        <ThemeSelector />

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Refresh data"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin theme-accent-text' : ''}`} />
        </button>

        {/* Quick New Issue Action */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold theme-btn-primary shadow-sm active:scale-95 transition-all flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Issue</span>
        </button>

        {/* Multi-Account Profile Switcher Menu */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 sm:p-1.5 pl-1.5 sm:pl-2 rounded-xl border theme-border hover:theme-surface-alt transition-colors"
              title={`${user.name} (${user.email}) - Click to switch profile or manage accounts`}
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                alt={user.name}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0"
              />
              <span className="text-xs font-semibold hidden md:inline max-w-[100px] truncate text-[var(--theme-text)]">
                {user.name.split(' ')[0]}
              </span>
              {sessions && sessions.length > 1 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full theme-btn-primary" title={`${sessions.length} active profiles`}>
                  {sessions.length}
                </span>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 theme-card rounded-2xl shadow-2xl border theme-border py-2 z-50 animate-scale-in">
                {/* Active Account Info */}
                <div className="px-3.5 py-2.5 border-b theme-border bg-black/5 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider theme-accent-text flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active Profile
                    </span>
                    <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded theme-subtle-badge">
                      {user.role || 'developer'}
                    </span>
                  </div>
                  <div className="font-bold text-xs truncate text-[var(--theme-text)] mt-1">{user.name}</div>
                  <div className="text-[10px] text-[var(--theme-text-muted)] truncate">{user.email}</div>
                  {user.team && (
                    <div className="text-[10px] text-[var(--theme-text-muted)] truncate mt-0.5">
                      {user.team}
                    </div>
                  )}
                </div>

                {/* Switch Account Section */}
                {otherProfiles.length > 0 ? (
                  <div className="py-2 px-3 border-b theme-border">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] mb-1.5 flex items-center justify-between">
                      <span>Available Profiles ({otherProfiles.length})</span>
                      <Users className="w-3 h-3" />
                    </div>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {otherProfiles.map((session) => (
                        <div
                          key={session.user._id || session.user.email}
                          className="flex items-center justify-between p-2 rounded-xl hover:theme-surface-alt border border-transparent hover:theme-border transition-all group cursor-pointer"
                          onClick={() => handleSwitch(session.user._id || session.user.email)}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={session.user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.email}`}
                              alt={session.user.name}
                              className="w-6 h-6 rounded-lg bg-slate-300 dark:bg-slate-700 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[var(--theme-text)] truncate leading-tight group-hover:theme-accent-text transition-colors">
                                {session.user.name}
                              </div>
                              <div className="text-[10px] text-[var(--theme-text-muted)] truncate leading-tight">
                                {session.user.email}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border theme-border hover:theme-btn-primary transition-all flex-shrink-0">
                            Switch
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-2.5 px-3.5 border-b theme-border text-center">
                    <p className="text-[11px] text-[var(--theme-text-muted)]">
                      No other profiles logged in yet.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="py-1">
                  {/* Add another profile link */}
                  <Link
                    to="/login?addAccount=true"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-[var(--theme-text)] hover:theme-surface-alt transition-colors font-medium"
                  >
                    <UserPlus className="w-3.5 h-3.5 theme-accent-text" />
                    <span>Log in to Another Account</span>
                  </Link>

                  {/* Manage Profiles Page */}
                  <Link
                    to="/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:theme-surface-alt transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage All Profiles</span>
                  </Link>

                  {/* Sign out current */}
                  <button
                    onClick={handleLogoutCurrent}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of this profile</span>
                  </button>

                  {/* Sign out all (if multiple accounts logged in) */}
                  {sessions.length > 1 && (
                    <button
                      onClick={handleLogoutAll}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-[11px] text-[var(--theme-text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                    >
                      <X className="w-3 h-3" />
                      <span>Sign out of all ({sessions.length}) profiles</span>
                    </button>
                  )}
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

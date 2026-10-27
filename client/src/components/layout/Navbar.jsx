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
  const { searchQuery, setSearchQuery, openCreateModal, triggerRefresh, loading, addToast } = useIssues();
  const { user, sessions, isAuthenticated, otherProfiles, switchAccount, logout, logoutAll } = useAuth();
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

        {/* Explicit Switch User button */}
        {isAuthenticated && user && (
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border theme-border hover:theme-surface-alt transition-colors text-[var(--theme-text)]"
            title={otherProfiles.length > 0 ? `Switch profile (${sessions.length} logged in)` : 'Switch or add user profile'}
          >
            <Users className="w-3.5 h-3.5 theme-accent-text" />
            <span className="hidden sm:inline">Switch User</span>
            {sessions.length > 1 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full theme-btn-primary">
                {sessions.length}
              </span>
            )}
          </button>
        )}

        {/* Multi-Account Profile Switcher Menu */}
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
              {otherProfiles.length > 0 && (
                <span className="w-2 h-2 rounded-full theme-btn-primary" title={`${otherProfiles.length} other account(s) saved`} />
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

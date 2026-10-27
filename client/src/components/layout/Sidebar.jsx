import React, { useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  BarChart3,
  History,
  Database,
  Layers,
  PanelLeftClose,
  User,
  LogIn,
  Users,
  FlaskConical,
} from 'lucide-react';
import { useIssues } from '../../context/IssueContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Kanban Board', path: '/board', icon: KanbanSquare },
  { name: 'All Issues', path: '/issues', icon: ListTodo },
  { name: 'Insights', path: '/insights', icon: BarChart3 },
  { name: 'Activity Feed', path: '/activity', icon: History },
];

export function Sidebar({
  isOpen,
  onClose,
  isVisible = true,
  onToggleVisibility,
  width = 256,
  onWidthChange,
}) {
  const { health, issues, testMode, toggleTestMode } = useIssues();
  const { user, sessions, isAuthenticated } = useAuth();
  const dbStatus = health?.database?.status || 'checking';
  const isAtlas = dbStatus === 'connected';

  const isResizing = useRef(false);

  // Drag-to-resize handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(190, Math.min(420, e.clientX));
      if (onWidthChange) {
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onWidthChange]);

  const startResizing = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar element with dynamic width, scrollable content, and resize handle */}
      <aside
        style={{ width: `${width}px` }}
        className={`fixed top-0 bottom-0 left-0 z-40 theme-sidebar text-slate-300 border-r theme-border flex flex-col transition-transform duration-200 ease-in-out select-none ${
          isOpen
            ? 'translate-x-0'
            : isVisible
            ? '-translate-x-full lg:translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Collapse Button */}
        <div className="h-16 px-4 flex items-center justify-between border-b theme-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl theme-btn-primary flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <div className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                <span>DevTrack</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded theme-subtle-badge">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate">
                Plan better. Ship faster.
              </div>
            </div>
          </Link>

          {/* Desktop hide/collapse toggle button */}
          <button
            onClick={onToggleVisibility}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Hide Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation and Workspace Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'theme-active-nav font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.name === 'All Issues' && issues?.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-slate-300 font-mono">
                        {issues.length}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick summary stats in sidebar */}
          <div className="p-3 bg-black/20 rounded-xl border theme-border">
            <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5">
              <span>Sprint Progress</span>
              <span className="font-mono text-slate-200">
                {issues.length > 0
                  ? `${Math.round(
                      (issues.filter((i) => i.status === 'Done').length / issues.length) * 100
                    )}%`
                  : '0%'}
              </span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="theme-btn-primary h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    issues.length > 0
                      ? Math.round(
                          (issues.filter((i) => i.status === 'Done').length / issues.length) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Test Mode Toggle in Sidebar */}
          <button
            onClick={() => toggleTestMode()}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              testMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                : 'bg-black/20 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-black/30'
            }`}
            title={testMode ? 'Click to disable Test Mode and view personal issues' : 'Click to enable Test Mode and view sample demo issues'}
          >
            <div className="flex items-center gap-2">
              <FlaskConical className={`w-3.5 h-3.5 ${testMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{testMode ? 'Test Mode Active' : 'Test Mode: Off'}</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                testMode ? 'bg-amber-400 ring-2 ring-amber-400/40' : 'bg-slate-600'
              }`}
            />
          </button>

          {/* User Account Tile */}
          <div className="p-2.5 rounded-xl border theme-border bg-black/20 flex items-center justify-between gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg bg-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0 truncate">
                    <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize truncate">{user.role}</div>
                  </div>
                </div>

                <Link
                  to={sessions && sessions.length > 1 ? '/login' : '/login?addAccount=true'}
                  onClick={onClose}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-white/10 hover:border-white/30 text-slate-300 hover:text-white flex items-center gap-1 transition-all flex-shrink-0"
                  title={sessions && sessions.length > 1 ? `Switch profile (${sessions.length} active)` : 'Add another account'}
                >
                  <Users className="w-3 h-3 theme-accent-text" />
                  <span>{sessions && sessions.length > 1 ? `Switch (${sessions.length})` : '+ Add'}</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Guest Mode</span>
                </div>
                <span className="text-[10px] font-bold theme-accent-text flex items-center gap-1">
                  <LogIn className="w-3 h-3" /> Sign In
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Database Status Indicator (Pinned at bottom) */}
        <div className="p-3 border-t theme-border text-xs flex-shrink-0 bg-black/10">
          <div className="flex items-center justify-between text-slate-400 mb-1.5 text-[10px] font-medium">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              <span>Storage Node</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">v1.0.0</span>
          </div>
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${
              isAtlas
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAtlas ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="truncate">
              {isAtlas ? 'MongoDB Atlas' : 'In-Memory Demo Mode'}
            </span>
          </div>
        </div>

        {/* Draggable resize handle on right edge */}
        <div
          onMouseDown={startResizing}
          title="Drag to resize sidebar width"
          className="hidden lg:flex absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/60 active:bg-indigo-500 transition-colors items-center justify-center group"
        >
          <div className="w-0.5 h-6 bg-slate-700 group-hover:bg-indigo-300 rounded-full" />
        </div>
      </aside>
    </>
  );
}

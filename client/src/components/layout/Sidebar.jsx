import React, { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  BarChart3,
  History,
  Database,
  Layers,
  PanelLeftClose,
  GripVertical,
} from 'lucide-react';
import { useIssues } from '../../context/IssueContext.jsx';

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
  const { health, issues } = useIssues();
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
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out select-none ${
          isOpen
            ? 'translate-x-0'
            : isVisible
            ? '-translate-x-full lg:translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Collapse Button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <div className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                <span>DevTrack</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate">
                Plan better. Ship faster.
              </div>
            </div>
          </div>

          {/* Desktop hide/collapse toggle button */}
          <button
            onClick={onToggleVisibility}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.name === 'All Issues' && issues?.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {issues.length}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick summary stats in sidebar */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
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
            <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
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
        </div>

        {/* Database Status Indicator (Pinned at bottom) */}
        <div className="p-3 border-t border-slate-800 text-xs flex-shrink-0">
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

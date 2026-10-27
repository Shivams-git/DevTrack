import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  BarChart3,
  History,
  CheckCircle2,
  Database,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useIssues } from '../../context/IssueContext.jsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Kanban Board', path: '/board', icon: KanbanSquare },
  { name: 'All Issues', path: '/issues', icon: ListTodo },
  { name: 'Insights', path: '/insights', icon: BarChart3 },
  { name: 'Activity Feed', path: '/activity', icon: History },
];

export function Sidebar({ isOpen, onClose }) {
  const { health, issues } = useIssues();
  const dbStatus = health?.database?.status || 'checking';
  const isAtlas = dbStatus === 'connected';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              DevTrack
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Plan better. Ship faster.</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.name === 'All Issues' && issues?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {issues.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick summary stats in sidebar */}
        <div className="p-3 mx-3 mb-3 bg-slate-800/40 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Overall Progress</span>
            <span className="font-mono text-slate-200">
              {issues.length > 0
                ? `${Math.round((issues.filter((i) => i.status === 'Done').length / issues.length) * 100)}%`
                : '0%'}
            </span>
          </div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  issues.length > 0
                    ? Math.round((issues.filter((i) => i.status === 'Done').length / issues.length) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Database Status Indicator */}
        <div className="p-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Data Storage</span>
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
      </aside>
    </>
  );
}

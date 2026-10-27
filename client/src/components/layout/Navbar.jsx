import React, { useState } from 'react';
import { Search, Plus, Menu, RotateCw, Sparkles, Filter } from 'lucide-react';
import { useIssues } from '../../context/IssueContext.jsx';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Overview Dashboard',
  '/board': 'Kanban Board',
  '/issues': 'All Issues',
  '/insights': 'Insights & Analytics',
  '/activity': 'Activity History',
};

export function Navbar({ onMenuClick }) {
  const { searchQuery, setSearchQuery, openCreateModal, triggerRefresh, loading } = useIssues();
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Developer Workflow';
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 max-w-lg justify-end">
        {/* Global Search */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues (DEV-001, auth...)"
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-lg border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh data"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Quick New Issue Action */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Issue</span>
        </button>
      </div>
    </header>
  );
}

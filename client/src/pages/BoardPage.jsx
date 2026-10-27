import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext.jsx';
import { KanbanColumn } from '../components/board/KanbanColumn.jsx';
import { Filter, X, Plus, Search } from 'lucide-react';

import { matchesSearch } from '../utils/formatters.js';

const COLUMNS = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];
const TYPES = ['All', 'Task', 'Bug', 'Feature', 'Improvement'];

export function BoardPage() {
  const {
    issues,
    loading,
    handleStatusChange,
    openCreateModal,
    searchQuery,
    setSearchQuery,
  } = useIssues();

  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [draggedIssue, setDraggedIssue] = useState(null);

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    // Search query with flexible matching
    if (searchQuery && !matchesSearch(issue, searchQuery)) {
      return false;
    }

    // Priority filter
    if (selectedPriority !== 'All' && issue.priority !== selectedPriority) {
      return false;
    }

    // Type filter
    if (selectedType !== 'All' && issue.type !== selectedType) {
      return false;
    }

    return true;
  });

  const hasActiveFilters =
    selectedPriority !== 'All' || selectedType !== 'All' || Boolean(searchQuery);

  const resetFilters = () => {
    setSelectedPriority('All');
    setSelectedType('All');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle flex-shrink-0 transition-colors">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Board:</span>
          </div>

          {/* Priority Select */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>

          {/* Type Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                Type: {t}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredIssues.length}</strong> of{' '}
            {issues.length} issues
          </span>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Area */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max pb-2">
          {COLUMNS.map((columnStatus) => {
            const columnIssues = filteredIssues.filter(
              (issue) => issue.status === columnStatus
            );
            return (
              <KanbanColumn
                key={columnStatus}
                status={columnStatus}
                issues={columnIssues}
                onDropIssue={(id, newStatus) => handleStatusChange(id, newStatus)}
                draggedIssue={draggedIssue}
                setDraggedIssue={setDraggedIssue}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

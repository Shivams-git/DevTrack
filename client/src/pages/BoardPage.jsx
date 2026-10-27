import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext.jsx';
import { KanbanColumn } from '../components/board/KanbanColumn.jsx';
import { Filter, X, Plus, Search, FlaskConical } from 'lucide-react';

import { matchesSearch } from '../utils/formatters.js';

const COLUMNS = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];
const TYPES = ['All', 'Task', 'Bug', 'Feature', 'Improvement'];

import { getDemoIssues } from '../data/demoIssues.js';

export function BoardPage() {
  const {
    issues,
    loading,
    handleStatusChange,
    openCreateModal,
    searchQuery,
    setSearchQuery,
    testMode,
    toggleTestMode,
  } = useIssues();

  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [draggedIssue, setDraggedIssue] = useState(null);

  const effectiveIssues = testMode
    ? (issues && issues.length > 0 ? issues : getDemoIssues())
    : issues;

  // Filter issues
  const filteredIssues = effectiveIssues.filter((issue) => {
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
      <div className="flex flex-wrap items-center justify-between gap-3 theme-card p-3.5 rounded-xl border theme-border shadow-subtle flex-shrink-0 transition-colors">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[var(--theme-text-muted)] font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Board:</span>
          </div>

          {/* Priority Select */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border theme-border theme-surface-alt hover:theme-subtle-badge text-[var(--theme-text)] font-medium focus:outline-none cursor-pointer"
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
            className="px-2.5 py-1.5 rounded-lg border theme-border theme-surface-alt hover:theme-subtle-badge text-[var(--theme-text)] font-medium focus:outline-none cursor-pointer"
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
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--theme-text-muted)] font-medium">
            Showing <strong className="text-[var(--theme-text)]">{filteredIssues.length}</strong> of{' '}
            {issues.length} issues
          </span>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold theme-btn-primary shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Test Mode Notification */}
      {testMode && (
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium flex-shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Test Mode Active:</strong> Viewing sample sprint tasks. Drag and drop cards between columns to test real-time workflow status updates.
            </span>
          </div>
          <button
            onClick={() => toggleTestMode(false)}
            className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold border border-amber-500/30 text-amber-800 dark:text-amber-200 transition-colors cursor-pointer"
          >
            Exit
          </button>
        </div>
      )}

      {/* Empty Board Helper Banner */}
      {issues.length === 0 && !loading && !testMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 px-4 rounded-xl border border-dashed theme-border theme-card text-xs flex-shrink-0">
          <div>
            <span className="font-semibold text-[var(--theme-text)]">
              Your Kanban board is currently clean.
            </span>{' '}
            <span className="text-[var(--theme-text-muted)]">
              Click &quot;+ Add Card&quot; to create your first personal issue, or turn on Test Mode to populate sample sprint tasks.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openCreateModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold theme-btn-primary transition-all cursor-pointer"
            >
              + Add Card
            </button>
            <button
              onClick={() => toggleTestMode(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Test Mode</span>
            </button>
          </div>
        </div>
      )}

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

import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext.jsx';
import {
  StatusBadge,
  PriorityBadge,
  TypeBadge,
  UrgencyBadge,
} from '../components/common/Badge.jsx';
import { formatDate, matchesSearch } from '../utils/formatters.js';
import { EmptyState } from '../components/common/EmptyState.jsx';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';

const STATUS_OPTIONS = ['All', 'Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Critical'];
const TYPE_OPTIONS = ['All', 'Task', 'Bug', 'Feature', 'Improvement'];
const SORT_OPTIONS = [
  { label: 'Recently Updated', value: 'updatedAt' },
  { label: 'Urgency (High to Low)', value: 'urgency' },
  { label: 'Due Date', value: 'dueDate' },
  { label: 'Created Date', value: 'createdAt' },
];

import { getDemoIssues } from '../data/demoIssues.js';

export function IssuesPage() {
  const {
    issues,
    loading,
    searchQuery,
    setSearchQuery,
    openCreateModal,
    openEditModal,
    openDetailModal,
    handleStatusChange,
    handleDeleteIssue,
    confirmAction,
    testMode,
    toggleTestMode,
  } = useIssues();

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const effectiveIssues = testMode
    ? (issues && issues.length > 0 ? issues : getDemoIssues())
    : issues;

  // Filter & Search using fuzzy matchesSearch helper
  const filtered = effectiveIssues.filter((issue) => {
    if (searchQuery && !matchesSearch(issue, searchQuery)) {
      return false;
    }

    if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;
    if (selectedPriority !== 'All' && issue.priority !== selectedPriority) return false;
    if (selectedType !== 'All' && issue.type !== selectedType) return false;

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'urgency') {
      return (b.urgencyScore || 0) - (a.urgencyScore || 0);
    }
    if (sortBy === 'dueDate') {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return timeA - timeB;
    }
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginatedIssues = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hasActiveFilters =
    selectedStatus !== 'All' ||
    selectedPriority !== 'All' ||
    selectedType !== 'All' ||
    Boolean(searchQuery);

  const resetFilters = () => {
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSelectedType('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const onDeleteClick = (e, issue) => {
    e.stopPropagation();
    confirmAction({
      title: `Delete ${issue.key}?`,
      message: `Are you sure you want to permanently delete "${issue.title}"?`,
      isDestructive: true,
      onConfirm: () => handleDeleteIssue(issue.key || issue._id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Test Mode Notification Banner */}
      {testMode && (
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Test Mode Active:</strong> Displaying sample demo issues. Switch off Test Mode anytime to view your personal issues.
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

      {/* Filters and Controls */}
      <div className="p-3.5 rounded-2xl theme-card border theme-border shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar with flexible search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID (e.g. DEV-001 or dev 001), title, or tag..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl theme-surface-alt text-[var(--theme-text)] border theme-border focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Create Button */}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold theme-btn-primary shadow-sm active:scale-95 transition-all flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Issue</span>
          </button>
        </div>

        {/* Filter Dropdowns row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {PRIORITY_OPTIONS.map((pr) => (
                <option key={pr} value={pr}>
                  Priority: {pr}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {TYPE_OPTIONS.map((tp) => (
                <option key={tp} value={tp}>
                  Type: {tp}
                </option>
              ))}
            </select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 font-semibold transition-colors"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table: Optimized compact font and widths so Actions (edit/delete) are immediately visible without horizontal scrolling */}
      <div className="theme-card rounded-2xl border theme-border shadow-subtle overflow-hidden">
        {paginatedIssues.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="theme-surface-alt border-b theme-border text-[var(--theme-text-muted)] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-20">Key</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Title</th>
                  <th className="py-2.5 px-2.5 w-24">Type</th>
                  <th className="py-2.5 px-2.5 w-28">Status</th>
                  <th className="py-2.5 px-2 w-20">Priority</th>
                  <th className="py-2.5 px-2 w-20">Urgency</th>
                  <th className="py-2.5 px-2.5 w-24">Due Date</th>
                  <th className="py-2.5 px-3 w-16 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border text-[var(--theme-text)]">
                {paginatedIssues.map((issue) => (
                  <tr
                    key={issue.key || issue._id}
                    onClick={() => openDetailModal(issue)}
                    className="hover:theme-surface-alt transition-colors cursor-pointer group"
                  >
                    {/* Key */}
                    <td className="py-2 px-3 font-mono font-bold theme-accent-text whitespace-nowrap">
                      {issue.key}
                    </td>

                    {/* Title */}
                    <td className="py-2 px-3">
                      <div className="font-semibold text-[var(--theme-text)] group-hover:theme-accent-text transition-colors line-clamp-1">
                        {issue.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {issue.isBlocked && (
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-1 rounded flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" /> Blocked
                          </span>
                        )}
                        {issue.labels && issue.labels.length > 0 && (
                          <div className="flex gap-1">
                            {issue.labels.slice(0, 2).map((l, i) => (
                              <span key={i} className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                                #{l}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-2 px-2.5 whitespace-nowrap">
                      <TypeBadge type={issue.type} size="xs" />
                    </td>

                    {/* Status with inline selector */}
                    <td
                      className="py-2 px-2.5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue.key || issue._id, e.target.value)}
                        className="text-[10px] py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        {STATUS_OPTIONS.filter((s) => s !== 'All').map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-2 px-2 whitespace-nowrap">
                      <PriorityBadge priority={issue.priority} size="xs" />
                    </td>

                    {/* Urgency */}
                    <td className="py-2 px-2 whitespace-nowrap">
                      {issue.urgencyLevel && (
                        <UrgencyBadge level={issue.urgencyLevel} score={issue.urgencyScore} />
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-2 px-2.5 whitespace-nowrap">
                      {issue.dueDate ? (
                        <div
                          className={`font-medium ${
                            issue.isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {formatDate(issue.dueDate)}
                          {issue.isOverdue && (
                            <span className="text-[9px] block text-rose-500 font-bold leading-none">
                              Overdue
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions: Edit & Delete immediately visible */}
                    <td
                      className="py-2 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(issue)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Issue"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => onDeleteClick(e, issue)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Issue"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            {issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed theme-border rounded-2xl theme-card shadow-subtle">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-3">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[var(--theme-text)] mb-1">
                  {testMode ? 'No demo issues found' : 'Your workspace is empty'}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] max-w-sm mb-5">
                  {testMode
                    ? 'No sample demo issues are currently loaded.'
                    : 'DevTrack starts with an empty dashboard for new accounts and guests. Create your first issue or switch on Test Mode to view sample tasks.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold theme-btn-primary rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Issue</span>
                  </button>
                  {!testMode && (
                    <button
                      onClick={() => toggleTestMode(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>Switch to Test Mode</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No issues match your filters"
                description="Try adjusting your search criteria or reset filters to see all issues."
                actionLabel="Reset Filters"
                onAction={resetFilters}
              />
            )}
          </div>
        )}

        {/* Pagination Bar */}
        {sorted.length > itemsPerPage && (
          <div className="px-3.5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} issues
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

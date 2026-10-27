import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext.jsx';
import {
  StatusBadge,
  PriorityBadge,
  TypeBadge,
  UrgencyBadge,
} from '../components/common/Badge.jsx';
import { formatDate, formatRelativeTime } from '../utils/formatters.js';
import { EmptyState } from '../components/common/EmptyState.jsx';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  X,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const STATUS_OPTIONS = ['All', 'Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Critical'];
const TYPE_OPTIONS = ['All', 'Task', 'Bug', 'Feature', 'Improvement'];
const SORT_OPTIONS = [
  { label: 'Most Recently Updated', value: 'updatedAt' },
  { label: 'Urgency Score (High to Low)', value: 'urgency' },
  { label: 'Due Date', value: 'dueDate' },
  { label: 'Creation Date', value: 'createdAt' },
];

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
  } = useIssues();

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter & Sort issues
  const filtered = issues.filter((issue) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        issue.key?.toLowerCase().includes(q) ||
        issue.title?.toLowerCase().includes(q) ||
        issue.description?.toLowerCase().includes(q) ||
        (issue.labels && issue.labels.some((l) => l.toLowerCase().includes(q)));
      if (!match) return false;
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
    // Default updatedAt
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
      message: `Are you sure you want to delete "${issue.title}"?`,
      isDestructive: true,
      onConfirm: () => handleDeleteIssue(issue.key || issue._id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, title, keyword, or #tag..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Create Button */}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Issue</span>
          </button>
        </div>

        {/* Filter Dropdowns row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
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

      {/* Issues Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        {paginatedIssues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 w-28">Issue Key</th>
                  <th className="py-3 px-4 min-w-[240px]">Title & Context</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Urgency</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedIssues.map((issue) => (
                  <tr
                    key={issue.key || issue._id}
                    onClick={() => openDetailModal(issue)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Key */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {issue.key}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {issue.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {issue.isBlocked && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 rounded flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Blocked
                          </span>
                        )}
                        {issue.labels && issue.labels.length > 0 && (
                          <div className="flex gap-1">
                            {issue.labels.slice(0, 2).map((l, i) => (
                              <span key={i} className="text-[10px] font-mono text-slate-400">
                                #{l}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <TypeBadge type={issue.type} size="xs" />
                    </td>

                    {/* Status */}
                    <td
                      className="py-3.5 px-3 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue.key || issue._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        {STATUS_OPTIONS.filter((s) => s !== 'All').map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <PriorityBadge priority={issue.priority} size="xs" />
                    </td>

                    {/* Urgency */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {issue.urgencyLevel && (
                        <UrgencyBadge level={issue.urgencyLevel} score={issue.urgencyScore} />
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {issue.dueDate ? (
                        <div
                          className={`font-medium ${
                            issue.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                          }`}
                        >
                          {formatDate(issue.dueDate)}
                          {issue.isOverdue && (
                            <span className="text-[10px] block text-rose-500 font-bold">
                              Overdue
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(issue)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Issue"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onDeleteClick(e, issue)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Issue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            <EmptyState
              title="No issues match your filters"
              description="Try adjusting your search criteria or reset filters to see all issues."
              actionLabel="Reset Filters"
              onAction={resetFilters}
            />
          </div>
        )}

        {/* Pagination Bar */}
        {sorted.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} issues
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

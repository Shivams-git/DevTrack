import React, { useState } from 'react';
import { useIssues } from '../../context/IssueContext.jsx';
import {
  PriorityBadge,
  TypeBadge,
  UrgencyBadge,
} from '../common/Badge.jsx';
import { formatDate } from '../../utils/formatters.js';
import {
  Calendar,
  AlertTriangle,
  Clock,
  MoreVertical,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

const STATUS_OPTIONS = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];

export function IssueCard({ issue, isDragging, onDragStart, onDragEnd }) {
  const { openDetailModal, openEditModal, handleStatusChange, handleDeleteIssue, confirmAction } = useIssues();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleCardClick = (e) => {
    // Avoid opening detail if user clicked on status dropdown or action button
    if (e.target.closest('.card-action-btn') || e.target.closest('select')) {
      return;
    }
    openDetailModal(issue);
  };

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    handleStatusChange(issue.key || issue._id, e.target.value);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, issue)}
      onDragEnd={onDragEnd}
      onClick={handleCardClick}
      className={`group relative bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle hover:shadow-hover hover:border-indigo-300 dark:hover:border-indigo-500/60 transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40 scale-95 border-indigo-400' : ''
      }`}
    >
      {/* Top row: Key, Type, Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/60">
            {issue.key}
          </span>
          <TypeBadge type={issue.type} size="xs" />
        </div>

        <div className="flex items-center gap-1">
          <PriorityBadge priority={issue.priority} size="xs" />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-2">
        {issue.title}
      </h4>

      {/* Blocked Alert Banner if blocked */}
      {issue.isBlocked && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md mb-2">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{issue.blockingReason || 'Blocked'}</span>
        </div>
      )}

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {issue.labels.slice(0, 3).map((l, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
            >
              #{l}
            </span>
          ))}
          {issue.labels.length > 3 && (
            <span className="text-[10px] font-mono px-1 py-0.5 text-slate-400">
              +{issue.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Card Footer: Due Date, Urgency, Status Selector */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Due date or estimated hours */}
        <div className="flex items-center gap-2">
          {issue.dueDate ? (
            <div
              className={`flex items-center gap-1 font-medium ${
                issue.isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title={issue.isOverdue ? 'Overdue!' : 'Due date'}
            >
              <Calendar className="w-3 h-3" />
              <span>{formatDate(issue.dueDate)}</span>
            </div>
          ) : issue.estimatedHours ? (
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500" title="Estimated effort">
              <Clock className="w-3 h-3" />
              <span>{issue.estimatedHours}h</span>
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-600 text-[11px]">—</span>
          )}
        </div>

        {/* Accessible status quick selector */}
        <div className="card-action-btn flex items-center">
          <select
            value={issue.status}
            onChange={handleStatusSelect}
            aria-label={`Change status for ${issue.key}`}
            className="text-[10px] py-0.5 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:border-indigo-500"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

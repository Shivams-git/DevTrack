import React from 'react';
import { useIssues } from '../../context/IssueContext.jsx';
import {
  StatusBadge,
  PriorityBadge,
  TypeBadge,
  UrgencyBadge,
} from '../common/Badge.jsx';
import { formatDate, formatRelativeTime } from '../../utils/formatters.js';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

const STATUS_OPTIONS = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];

export function IssueDetailModal() {
  const {
    activeModal,
    closeModal,
    openEditModal,
    handleStatusChange,
    handleDeleteIssue,
    confirmAction,
  } = useIssues();

  const isOpen = activeModal.type === 'detail';
  const issue = activeModal.issue;

  if (!isOpen || !issue) return null;

  const onDelete = () => {
    confirmAction({
      title: `Delete ${issue.key}?`,
      message: `Are you sure you want to permanently delete "${issue.title}"? This action will be logged in the activity history.`,
      isDestructive: true,
      onConfirm: () => handleDeleteIssue(issue.key || issue._id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              {issue.key}
            </span>
            <TypeBadge type={issue.type} />
            <PriorityBadge priority={issue.priority} />
            {issue.urgencyLevel && (
              <UrgencyBadge level={issue.urgencyLevel} score={issue.urgencyScore} />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(issue)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Edit Issue"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{issue.title}</h2>
          </div>

          {/* Blocked banner if applicable */}
          {issue.isBlocked && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Issue Blocked
                </div>
                <div className="text-sm font-medium mt-0.5">
                  {issue.blockingReason || 'No specific blocking reason given'}
                </div>
              </div>
            </div>
          )}

          {/* Status Switcher Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Current Status:
              </span>
              <StatusBadge status={issue.status} />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Move to:</span>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(issue.key || issue._id, st)}
                    disabled={st === issue.status}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                      st === issue.status
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Due Date</span>
              <div className="font-medium text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className={issue.isOverdue ? 'text-rose-600 font-bold' : ''}>
                  {formatDate(issue.dueDate)}
                </span>
                {issue.isOverdue && (
                  <span className="text-[10px] text-rose-600 font-bold uppercase ml-1">
                    [Overdue]
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Estimated Effort</span>
              <div className="font-medium text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{issue.estimatedHours ? `${issue.estimatedHours}h` : 'Not set'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Created</span>
              <div className="font-medium text-slate-800" title={formatDate(issue.createdAt)}>
                {formatRelativeTime(issue.createdAt)}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Last Updated</span>
              <div className="font-medium text-slate-800" title={formatDate(issue.updatedAt)}>
                {formatRelativeTime(issue.updatedAt)}
              </div>
            </div>
          </div>

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Labels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {issue.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    #{label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Description
            </span>
            <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
              {issue.description || 'No detailed description provided for this issue.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

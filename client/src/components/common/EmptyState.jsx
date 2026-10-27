import React from 'react';
import { FolderGit2, Plus } from 'lucide-react';
import { useIssues } from '../../context/IssueContext.jsx';

export function EmptyState({
  title = 'No issues found',
  description = 'Get started by creating a new task, bug report, or feature request.',
  showAction = true,
  actionLabel = 'Create First Issue',
  onAction,
}) {
  const { openCreateModal } = useIssues();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
        <FolderGit2 className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {showAction && (
        <button
          onClick={onAction || openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

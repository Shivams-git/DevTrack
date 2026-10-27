import React, { useState } from 'react';
import { IssueCard } from './IssueCard.jsx';
import { STATUS_STYLES } from '../../utils/formatters.js';
import { Plus } from 'lucide-react';
import { useIssues } from '../../context/IssueContext.jsx';

export function KanbanColumn({
  status,
  issues,
  onDropIssue,
  draggedIssue,
  setDraggedIssue,
}) {
  const [isOver, setIsOver] = useState(false);
  const { openCreateModal } = useIssues();
  const style = STATUS_STYLES[status] || STATUS_STYLES.Backlog;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    // Only set to false if leaving the column element itself
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    if (draggedIssue && draggedIssue.status !== status) {
      onDropIssue(draggedIssue.key || draggedIssue._id, status);
    }
    setDraggedIssue(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[280px] max-w-xs sm:max-w-none bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border transition-colors ${
        isOver
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 border-dashed'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {status}
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold shadow-xs border border-slate-200/60 dark:border-slate-700">
            {issues.length}
          </span>
        </div>

        <button
          onClick={openCreateModal}
          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title={`Add issue to ${status}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Issues List Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[300px] pr-0.5">
        {issues.map((issue) => (
          <IssueCard
            key={issue.key || issue._id}
            issue={issue}
            isDragging={draggedIssue?.key === issue.key}
            onDragStart={(e, iss) => {
              e.dataTransfer.setData('text/plain', iss.key);
              setDraggedIssue(iss);
            }}
            onDragEnd={() => setDraggedIssue(null)}
          />
        ))}

        {issues.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}

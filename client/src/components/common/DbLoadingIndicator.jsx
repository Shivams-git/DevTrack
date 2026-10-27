import React from 'react';
import { useIssues } from '../../context/IssueContext.jsx';
import { Database, Loader2 } from 'lucide-react';

export function DbLoadingIndicator() {
  const { isDbLoading } = useIssues();

  if (!isDbLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full border theme-border theme-card shadow-2xl backdrop-blur-md text-xs font-semibold text-[var(--theme-text)] animate-slide-up transition-all"
    >
      <Loader2 className="w-4 h-4 animate-spin text-[var(--theme-primary)] flex-shrink-0" />
      <div className="flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
        <span>Loading data from database...</span>
      </div>
    </div>
  );
}

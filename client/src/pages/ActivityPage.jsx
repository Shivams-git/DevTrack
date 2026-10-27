import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useIssues } from '../context/IssueContext.jsx';
import { formatDate, formatRelativeTime } from '../utils/formatters.js';
import { getDemoActivities } from '../data/demoIssues.js';
import {
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  Edit2,
  PlusCircle,
  RotateCw,
} from 'lucide-react';

export function ActivityPage() {
  const { openDetailModal, issues, testMode } = useIssues();
  const [activities, setActivities] = useState(() => (testMode ? getDemoActivities() : []));
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.getActivity(50);
      if (res.success && res.data && res.data.length > 0) {
        setActivities(res.data);
      } else if (testMode) {
        setActivities(getDemoActivities());
      } else {
        setActivities([]);
      }
    } catch (err) {
      if (testMode) {
        setActivities(getDemoActivities());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [issues, testMode]);

  const handleIssueClick = (issueKey) => {
    if (!issueKey) return;
    const match = issues.find((i) => i.key === issueKey);
    if (match) {
      openDetailModal(match);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'ISSUE_CREATED':
        return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'STATUS_CHANGED':
        return <ArrowRight className="w-4 h-4 theme-accent-text" />;
      case 'PRIORITY_CHANGED':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'ISSUE_DELETED':
        return <Trash2 className="w-4 h-4 text-rose-500" />;
      default:
        return <Edit2 className="w-4 h-4 theme-accent-text" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="theme-card p-6 rounded-2xl border theme-border shadow-subtle flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 theme-accent-text font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            Audit Log & Event Stream
          </div>
          <h2 className="text-xl font-extrabold text-[var(--theme-text)] tracking-tight">
            Activity History
          </h2>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1">
            Persistent audit trail tracking all issue creations, status transitions, priority changes, and deletions.
          </p>
        </div>

        <button
          onClick={fetchActivities}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="Refresh activity feed"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin theme-accent-text' : ''}`} />
        </button>
      </div>

      {/* Timeline Stream */}
      <div className="theme-card rounded-2xl border theme-border shadow-subtle p-6">
        {activities.length > 0 ? (
          <div className="relative border-l theme-border ml-4 space-y-6">
            {activities.map((act, index) => (
              <div key={act._id || index} className="relative pl-6 group">
                {/* Event bullet with action icon */}
                <div className="absolute -left-3 top-1 w-6 h-6 rounded-full theme-surface-alt border theme-border shadow-xs flex items-center justify-center group-hover:scale-110 group-hover:border-[var(--theme-primary)] transition-all">
                  {getActionIcon(act.action)}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  {/* Description & Issue Key */}
                  <div className="text-xs text-[var(--theme-text)]">
                    <span className="font-medium">{act.description}</span>
                    {act.issueKey && (
                      <button
                        onClick={() => handleIssueClick(act.issueKey)}
                        className="ml-2 font-mono font-bold theme-subtle-badge px-1.5 py-0.5 rounded text-[11px] hover:underline cursor-pointer"
                      >
                        {act.issueKey}
                      </button>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-[11px] text-[var(--theme-text-muted)] flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span title={formatDate(act.createdAt)}>
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Metadata tags if present */}
                {act.metadata && (act.metadata.from || act.metadata.to) && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded theme-surface-alt text-[var(--theme-text)] border theme-border font-medium">
                      {act.metadata.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="px-2 py-0.5 rounded theme-subtle-badge font-semibold">
                      {act.metadata.to}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-[var(--theme-text-muted)]">
            No activities recorded yet. Activities will appear as you create and update issues.
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useIssues } from '../context/IssueContext.jsx';
import { api } from '../services/api.js';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Plus,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { StatusBadge, PriorityBadge, UrgencyBadge } from '../components/common/Badge.jsx';
import { formatDate, formatRelativeTime } from '../utils/formatters.js';

const STATUS_COLORS = {
  Backlog: '#94a3b8',
  Todo: '#3b82f6',
  'In Progress': '#f59e0b',
  'In Review': '#a855f7',
  Done: '#10b981',
};

const PRIORITY_COLORS = {
  Low: '#94a3b8',
  Medium: '#38bdf8',
  High: '#f59e0b',
  Critical: '#ef4444',
};

function StatusPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = STATUS_COLORS[data.name] || '#6366f1';
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="text-[11px] font-semibold text-slate-400 mb-1">Status Section</div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-semibold text-slate-100">{data.name}:</span>
          <span className="text-xs font-mono font-bold text-white">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
}

function PriorityBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = PRIORITY_COLORS[label] || '#4f46e5';
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="text-[11px] font-semibold text-slate-400 mb-1">{label} Priority</div>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium text-slate-200">Issues:</span>
          <span className="text-xs font-mono font-bold text-white">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
}

import { getDemoIssues } from '../data/demoIssues.js';

export function DashboardPage() {
  const {
    openCreateModal,
    openDetailModal,
    issues,
    loading,
    triggerRefresh,
    testMode,
    toggleTestMode,
  } = useIssues();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const effectiveIssues = testMode
    ? (issues && issues.length > 0 ? issues : getDemoIssues())
    : issues;

  useEffect(() => {
    // Reset dashboard data when toggling test mode to avoid showing stale 0s
    setDashboardData(null);
  }, [testMode]);

  useEffect(() => {
    let isMounted = true;
    api
      .getDashboard()
      .then((res) => {
        if (isMounted && res.success) {
          setDashboardData(res.data);
        }
      })
      .catch((err) => console.error('Error fetching dashboard metrics:', err))
      .finally(() => {
        if (isMounted) setLoadingStats(false);
      });

    return () => {
      isMounted = false;
    };
  }, [issues, testMode]);

  // In test mode, compute immediately from seed data so user never waits for database
  const useServerData = !testMode && Boolean(dashboardData?.metrics);

  const metrics = useServerData
    ? dashboardData.metrics
    : {
        total: effectiveIssues.length,
        completed: effectiveIssues.filter((i) => i.status === 'Done').length,
        inProgress: effectiveIssues.filter((i) => i.status === 'In Progress').length,
        overdue: effectiveIssues.filter((i) => i.isOverdue).length,
        blocked: effectiveIssues.filter((i) => i.isBlocked && i.status !== 'Done').length,
        completionPercentage:
          effectiveIssues.length > 0
            ? Math.round(
                (effectiveIssues.filter((i) => i.status === 'Done').length / effectiveIssues.length) * 100
              )
            : 0,
      };

  // Prepare chart data (computed instantly from effectiveIssues)
  const statusChartData = (useServerData && dashboardData?.statusCounts)
    ? Object.entries(dashboardData.statusCounts)
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name, value }))
    : ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done']
        .map((name) => ({
          name,
          value: effectiveIssues.filter((i) => i.status === name).length,
        }))
        .filter((d) => d.value > 0);

  const priorityChartData = (useServerData && dashboardData?.priorityCounts)
    ? Object.entries(dashboardData.priorityCounts).map(([name, count]) => ({
        name,
        count,
      }))
    : ['Low', 'Medium', 'High', 'Critical'].map((name) => ({
        name,
        count: effectiveIssues.filter((i) => i.priority === name).length,
      }));

  const urgentTasks = (useServerData && dashboardData?.urgentTasks?.length > 0)
    ? dashboardData.urgentTasks
    : effectiveIssues
        .filter((i) => i.status !== 'Done' && (i.urgencyScore >= 30 || i.isBlocked || i.isOverdue))
        .sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0))
        .slice(0, 5);

  const upcomingDeadlines = (useServerData && dashboardData?.upcomingDeadlines?.length > 0)
    ? dashboardData.upcomingDeadlines
    : effectiveIssues
        .filter((i) => i.status !== 'Done' && i.dueDate && !i.isOverdue)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl shadow-xl border theme-border theme-card">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold theme-subtle-badge mb-2">
            <Flame className="w-3.5 h-3.5" />
            Developer Sprint Overview
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--theme-text)]">
            Sprint Status & Velocity
          </h2>
          <p className="text-[var(--theme-text-muted)] text-xs sm:text-sm mt-1 max-w-xl">
            Real-time developer workflow tracking with automated priority scoring and overdue detection.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold theme-btn-primary active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Issue</span>
        </button>
      </div>

      {/* Test Mode Notification Banner */}
      {testMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Test Mode Active:</strong> You are currently viewing pre-existing sample/demo issues. Your personal issues are stored safely and independently in MongoDB.
            </span>
          </div>
          <button
            onClick={() => toggleTestMode(false)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold border border-amber-500/30 text-amber-800 dark:text-amber-200 transition-colors flex-shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Exit Test Mode
          </button>
        </div>
      )}

      {/* Empty Workspace Onboarding Box (shown when workspace has 0 issues and Test Mode is OFF) */}
      {metrics.total === 0 && !testMode && (
        <div className="p-8 sm:p-10 rounded-2xl border-2 border-dashed theme-border theme-card flex flex-col items-center justify-center text-center shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-500 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--theme-text)]">
            Your Workspace is Clean and Ready
          </h3>
          <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] max-w-md mt-1 mb-6">
            New accounts and guests start with a completely empty dashboard. Create your first real task, or turn on <strong>Test Mode</strong> to preview sample issues and analytics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold theme-btn-primary shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Issue</span>
            </button>
            <button
              onClick={() => toggleTestMode(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Enable Test Mode (Load Demo Issues)</span>
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Issues */}
        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--theme-text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Issues</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-[var(--theme-text)] font-mono">{metrics.total}</div>
          <div className="text-[11px] text-[var(--theme-text-muted)] mt-1">Across all workflow states</div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500 font-mono">{metrics.inProgress}</div>
          <div className="text-[11px] text-[var(--theme-text-muted)] mt-1">Actively being worked on</div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500 font-mono">{metrics.completed}</div>
          <div className="text-[11px] text-[var(--theme-text-muted)] mt-1">
            {metrics.completionPercentage}% completion rate
          </div>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-500 font-mono">{metrics.overdue}</div>
          <div className="text-[11px] text-[var(--theme-text-muted)] mt-1">Requires immediate attention</div>
        </div>

        {/* Blocked */}
        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between theme-accent-text mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blocked</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black theme-accent-text font-mono">{metrics.blocked}</div>
          <div className="text-[11px] text-[var(--theme-text-muted)] mt-1">External blockers flagged</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="p-5 rounded-2xl theme-card border theme-border shadow-subtle">
          <h3 className="text-sm font-bold text-[var(--theme-text)] mb-1">Issue Distribution by Status</h3>
          <p className="text-xs text-[var(--theme-text-muted)] mb-4">Current distribution across Kanban pipeline</p>

          {statusChartData.length > 0 ? (
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || '#6366f1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<StatusPieTooltip />}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    itemStyle={{
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    labelStyle={{
                      color: '#f1f5f9',
                      fontWeight: 600,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 ml-2 text-xs">
                {statusChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[entry.name] || '#6366f1' }}
                    />
                    <span className="text-[var(--theme-text-muted)]">{entry.name}:</span>
                    <span className="font-mono font-bold text-[var(--theme-text)]">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-slate-400">
              No issue status data available
            </div>
          )}
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="p-5 rounded-2xl theme-card border theme-border shadow-subtle">
          <h3 className="text-sm font-bold text-[var(--theme-text)] mb-1">Issues by Priority</h3>
          <p className="text-xs text-[var(--theme-text-muted)] mb-4">Workload breakdown by severity level</p>

          {priorityChartData.length > 0 ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    content={<PriorityBarTooltip />}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    itemStyle={{
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    labelStyle={{
                      color: '#f1f5f9',
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#4f46e5">
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={PRIORITY_COLORS[entry.name] || '#4f46e5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-slate-400">
              No priority data available
            </div>
          )}
        </div>
      </div>

      {/* Two Column Section: Urgent/Overdue Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent or Overdue Work */}
        <div className="p-5 rounded-2xl theme-card border theme-border shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-[var(--theme-text)]">Highest Urgency Tasks</h3>
            </div>
            <span className="text-[11px] text-[var(--theme-text-muted)] font-mono">Ranked by score</span>
          </div>

          <div className="space-y-2.5">
            {urgentTasks && urgentTasks.length > 0 ? (
              urgentTasks.map((task) => (
                <div
                  key={task.key}
                  onClick={() => openDetailModal(task)}
                  className="flex items-center justify-between p-3 rounded-xl border theme-border hover:theme-subtle-badge transition-all cursor-pointer group"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold theme-accent-text">
                        {task.key}
                      </span>
                      <PriorityBadge priority={task.priority} size="xs" />
                      {task.isBlocked && (
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-1.5 py-0.2 rounded">
                          BLOCKED
                        </span>
                      )}
                      {task.isOverdue && (
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.2 rounded">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[var(--theme-text)] truncate group-hover:theme-accent-text transition-colors">
                      {task.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <UrgencyBadge level={task.urgencyLevel} score={task.urgencyScore} />
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:theme-accent-text transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[var(--theme-text-muted)]">
                🎉 No critical or overdue tasks pending!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines & Recently Updated */}
        <div className="p-5 rounded-2xl theme-card border theme-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-[var(--theme-text)]">Upcoming Deadlines</h3>
              </div>
              <span className="text-[11px] text-[var(--theme-text-muted)]">Next 7 days</span>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((task) => (
                  <div
                    key={task.key}
                    onClick={() => openDetailModal(task)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {task.key}
                        </span>
                        <StatusBadge status={task.status} size="xs" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60">
                        {formatDate(task.dueDate)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatRelativeTime(task.dueDate)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No upcoming deadlines scheduled for this week.
                </div>
              )}
            </div>
          </div>

          {/* Quick link to board */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">View cards in column view</span>
            <a
              href="/board"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              Open Kanban Board <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export function DashboardPage() {
  const { openCreateModal, openDetailModal, issues, loading, triggerRefresh } = useIssues();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

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
  }, [issues]);

  const metrics = dashboardData?.metrics || {
    total: issues.length,
    completed: issues.filter((i) => i.status === 'Done').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    overdue: issues.filter((i) => i.isOverdue).length,
    blocked: issues.filter((i) => i.isBlocked && i.status !== 'Done').length,
    completionPercentage:
      issues.length > 0
        ? Math.round((issues.filter((i) => i.status === 'Done').length / issues.length) * 100)
        : 0,
  };

  // Prepare chart data
  const statusChartData = dashboardData?.statusCounts
    ? Object.entries(dashboardData.statusCounts)
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const priorityChartData = dashboardData?.priorityCounts
    ? Object.entries(dashboardData.priorityCounts).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <Flame className="w-3.5 h-3.5 text-indigo-400" />
            Developer Sprint Overview
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Sprint Status & Velocity
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time developer workflow tracking with automated priority scoring and overdue detection.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Issue</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Issues */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Issues</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all workflow states</div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{metrics.inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-1">Actively being worked on</div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{metrics.completed}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.completionPercentage}% completion rate
          </div>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">{metrics.overdue}</div>
          <div className="text-[11px] text-slate-400 mt-1">Requires immediate attention</div>
        </div>

        {/* Blocked */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blocked</span>
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono">{metrics.blocked}</div>
          <div className="text-[11px] text-slate-400 mt-1">External blockers flagged</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Issue Distribution by Status</h3>
          <p className="text-xs text-slate-500 mb-4">Current distribution across Kanban pipeline</p>

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
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
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
                    <span className="text-slate-600">{entry.name}:</span>
                    <span className="font-mono font-bold text-slate-900">{entry.value}</span>
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
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Issues by Priority</h3>
          <p className="text-xs text-slate-500 mb-4">Workload breakdown by severity level</p>

          {priorityChartData.length > 0 ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
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
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Highest Urgency Tasks</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Ranked by score</span>
          </div>

          <div className="space-y-2.5">
            {dashboardData?.urgentTasks && dashboardData.urgentTasks.length > 0 ? (
              dashboardData.urgentTasks.map((task) => (
                <div
                  key={task.key}
                  onClick={() => openDetailModal(task)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {task.key}
                      </span>
                      <PriorityBadge priority={task.priority} size="xs" />
                      {task.isBlocked && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          BLOCKED
                        </span>
                      )}
                      {task.isOverdue && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <UrgencyBadge level={task.urgencyLevel} score={task.urgencyScore} />
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                🎉 No critical or overdue tasks pending!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines & Recently Updated */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>
              </div>
              <span className="text-[11px] text-slate-400">Next 7 days</span>
            </div>

            <div className="space-y-2.5">
              {dashboardData?.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 ? (
                dashboardData.upcomingDeadlines.map((task) => (
                  <div
                    key={task.key}
                    onClick={() => openDetailModal(task)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {task.key}
                        </span>
                        <StatusBadge status={task.status} size="xs" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">View cards in column view</span>
            <a
              href="/board"
              className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Open Kanban Board <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

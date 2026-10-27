import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useIssues } from '../context/IssueContext.jsx';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  HelpCircle,
} from 'lucide-react';

const STATUS_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#a855f7', '#10b981'];
const PRIORITY_COLORS = ['#94a3b8', '#38bdf8', '#f59e0b', '#ef4444'];
const TYPE_COLORS = ['#3b82f6', '#ef4444', '#6366f1', '#14b8a6'];

function PipelineTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="text-[11px] font-semibold text-slate-400 mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-200">Issues:</span>
          <span className="text-xs font-mono font-bold text-white">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
}

function PriorityPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="text-[11px] font-semibold text-slate-400 mb-1">Priority Section</div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-100">{data.name}:</span>
          <span className="text-xs font-mono font-bold text-white">{data.value} issues</span>
        </div>
      </div>
    );
  }
  return null;
}

function IssueTypeTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="text-[11px] font-semibold text-slate-400 mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-200">Total:</span>
          <span className="text-xs font-mono font-bold text-white">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function InsightsPage() {
  const { issues } = useIssues();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .getInsights()
      .then((res) => {
        if (mounted && res.success) {
          setInsights(res.data);
        }
      })
      .catch((err) => console.error('Failed to load insights:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [issues]);

  const total = insights?.total || issues.length;
  const completed = insights?.completed || issues.filter((i) => i.status === 'Done').length;
  const overdue = insights?.overdue || issues.filter((i) => i.isOverdue).length;
  const inProgress =
    insights?.inProgress || issues.filter((i) => i.status === 'In Progress').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusData = insights?.byStatus
    ? Object.entries(insights.byStatus).map(([name, count]) => ({ name, count }))
    : [];

  const priorityData = insights?.byPriority
    ? Object.entries(insights.byPriority).map(([name, count]) => ({ name, count }))
    : [];

  const typeData = insights?.byType
    ? Object.entries(insights.byType).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="theme-card p-6 rounded-2xl border theme-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 theme-accent-text font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            Workflow Analytics & Health
          </div>
          <h2 className="text-xl font-extrabold text-[var(--theme-text)] tracking-tight">
            Developer Velocity Insights
          </h2>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-xl">
            Live metrics and distribution breakdowns derived from active issues in your repository.
          </p>
        </div>

        {/* Completion Rate Pill */}
        <div className="flex items-center gap-4 theme-surface-alt p-3 rounded-xl border theme-border self-start md:self-auto">
          <div>
            <div className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
              Completion Rate
            </div>
            <div className="text-2xl font-black text-[var(--theme-text)] font-mono">
              {completionRate}%
            </div>
          </div>
          <div className="w-16 h-16 flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-full border-4 border-slate-200/40 border-t-emerald-500 flex items-center justify-center text-xs font-bold"
              style={{
                background: `conic-gradient(#10b981 ${completionRate * 3.6}deg, rgba(200,200,200,0.15) 0deg)`,
              }}
            >
              <div className="w-9 h-9 rounded-full theme-card flex items-center justify-center text-[10px] font-mono font-bold text-[var(--theme-text)]">
                {completed}/{total}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle">
          <span className="text-xs font-medium text-[var(--theme-text-muted)] block">Total Workload</span>
          <div className="text-2xl font-black text-[var(--theme-text)] font-mono mt-1">{total}</div>
          <span className="text-[11px] text-[var(--theme-text-muted)]">Total registered issues</span>
        </div>

        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle">
          <span className="text-xs font-medium text-emerald-500 block">Shipped / Done</span>
          <div className="text-2xl font-black text-emerald-500 font-mono mt-1">{completed}</div>
          <span className="text-[11px] text-[var(--theme-text-muted)]">Successfully closed</span>
        </div>

        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle">
          <span className="text-xs font-medium text-amber-500 block">Work In Progress</span>
          <div className="text-2xl font-black text-amber-500 font-mono mt-1">{inProgress}</div>
          <span className="text-[11px] text-[var(--theme-text-muted)]">Currently active sprint items</span>
        </div>

        <div className="p-4 rounded-xl theme-card border theme-border shadow-subtle">
          <span className="text-xs font-medium text-rose-500 block">Overdue Items</span>
          <div className="text-2xl font-black text-rose-500 font-mono mt-1">{overdue}</div>
          <span className="text-[11px] text-[var(--theme-text-muted)]">Past target delivery date</span>
        </div>
      </div>

      {/* Chart Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-2xl theme-card border theme-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 theme-accent-text" />
              <h3 className="text-sm font-bold text-[var(--theme-text)]">Pipeline Distribution</h3>
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] mb-4">
              Breakdown of issues across Backlog, Todo, In Progress, In Review, and Done.
            </p>
          </div>

          <div className="h-64 w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} allowDecimals={false} />
                  <Tooltip
                    content={<PipelineTooltip />}
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
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </div>
          <div className="text-[11px] text-[var(--theme-text-muted)] pt-2 border-t theme-border flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Optimal workflow balances items across Todo and In Progress without backlog bottlenecks.</span>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-5 rounded-2xl theme-card border theme-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-[var(--theme-text)]">Priority & Severity Exposure</h3>
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] mb-4">
              Proportion of Critical, High, Medium, and Low severity issues.
            </p>
          </div>

          <div className="h-64 w-full">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`priority-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<PriorityPieTooltip />}
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
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </div>
          <div className="text-[11px] text-[var(--theme-text-muted)] pt-2 border-t theme-border flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Critical issues receive highest urgency score weighting and overdue penalties.</span>
          </div>
        </div>
      </div>

      {/* Chart Grid: Row 2 - Workload by Issue Type */}
      <div className="p-5 rounded-2xl theme-card border theme-border shadow-subtle">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 theme-accent-text" />
          <h3 className="text-sm font-bold text-[var(--theme-text)]">Workload Grouped by Issue Type</h3>
        </div>
        <p className="text-xs text-[var(--theme-text-muted)] mb-4">
          Distribution between Tasks, Bugs, Features, and Improvements.
        </p>

        <div className="h-56 w-full">
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={<IssueTypeTooltip />}
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
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={`type-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

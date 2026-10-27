import React from 'react';
import {
  STATUS_STYLES,
  PRIORITY_STYLES,
  TYPE_STYLES,
  URGENCY_STYLES,
} from '../../utils/formatters.js';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Sparkles,
  Bug,
  CheckSquare,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export function StatusBadge({ status, size = 'sm' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Backlog;
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      {priority === 'Critical' && <Flame className="w-3 h-3 text-rose-600" />}
      {priority === 'High' && <ArrowUpRight className="w-3 h-3 text-amber-600" />}
      {priority === 'Medium' && <TrendingUp className="w-3 h-3 text-sky-600" />}
      {priority === 'Low' && <Clock className="w-3 h-3 text-slate-500" />}
      {priority}
    </span>
  );
}

export function TypeBadge({ type, size = 'sm' }) {
  const style = TYPE_STYLES[type] || TYPE_STYLES.Task;
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      {type === 'Bug' && <Bug className="w-3 h-3" />}
      {type === 'Feature' && <Sparkles className="w-3 h-3" />}
      {type === 'Improvement' && <TrendingUp className="w-3 h-3" />}
      {type === 'Task' && <CheckSquare className="w-3 h-3" />}
      {type}
    </span>
  );
}

export function UrgencyBadge({ level, score }) {
  const style = URGENCY_STYLES[level] || URGENCY_STYLES.Low;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${style.bg}`}
      title={`Urgency Score: ${score || 0}/120`}
    >
      {level === 'Critical' && <Flame className="w-3 h-3" />}
      {level} {score !== undefined && `(${score})`}
    </span>
  );
}

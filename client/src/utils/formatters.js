/**
 * Format date to clean human-readable string
 */
export function formatDate(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format relative time (e.g. "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHours = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffDays) > 0) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) > 0) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffMin) > 0) return rtf.format(diffMin, 'minute');
  return 'just now';
}

/**
 * Color maps for Badges
 */
export const STATUS_STYLES = {
  Backlog: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
  },
  Todo: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  'In Progress': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  'In Review': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  Done: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export const PRIORITY_STYLES = {
  Low: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    color: '#64748b',
  },
  Medium: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    color: '#0284c7',
  },
  High: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    color: '#d97706',
  },
  Critical: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    color: '#e11d48',
  },
};

export const TYPE_STYLES = {
  Task: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  Bug: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  Feature: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  Improvement: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
};

export const URGENCY_STYLES = {
  Critical: {
    bg: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
  },
  High: {
    bg: 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
  },
  Medium: {
    bg: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  Low: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
  },
};

/**
 * Flexible search helper matching keys (e.g. "dev - 001", "dev 001", "dev-001"), titles, tags, and status
 */
export function matchesSearch(issue, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!issue) return false;

  const q = rawQuery.toLowerCase().trim();
  const normalizedQ = q.replace(/[\s-_]+/g, '');
  const itemKey = (issue.key || '').toLowerCase();
  const normalizedKey = itemKey.replace(/[\s-_]+/g, '');

  if (itemKey.includes(q) || (normalizedQ && normalizedKey.includes(normalizedQ))) {
    return true;
  }
  if (issue.title && issue.title.toLowerCase().includes(q)) {
    return true;
  }
  if (issue.description && issue.description.toLowerCase().includes(q)) {
    return true;
  }
  if (Array.isArray(issue.labels) && issue.labels.some((l) => l.toLowerCase().includes(q))) {
    return true;
  }
  if (issue.type && issue.type.toLowerCase().includes(q)) {
    return true;
  }
  if (issue.priority && issue.priority.toLowerCase().includes(q)) {
    return true;
  }
  if (issue.status && issue.status.toLowerCase().includes(q)) {
    return true;
  }

  return false;
}


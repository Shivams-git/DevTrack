export const STATUSES = {
  BACKLOG: 'Backlog',
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export const STATUS_LIST = Object.values(STATUSES);

export const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const PRIORITY_LIST = Object.values(PRIORITIES);

export const TYPES = {
  TASK: 'Task',
  BUG: 'Bug',
  FEATURE: 'Feature',
  IMPROVEMENT: 'Improvement',
};

export const TYPE_LIST = Object.values(TYPES);

export const URGENCY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const ACTIVITY_ACTIONS = {
  ISSUE_CREATED: 'ISSUE_CREATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  ISSUE_UPDATED: 'ISSUE_UPDATED',
  ISSUE_DELETED: 'ISSUE_DELETED',
};

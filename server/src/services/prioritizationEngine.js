import { STATUSES, PRIORITIES, URGENCY_LEVELS } from '../utils/constants.js';

/**
 * Checks whether an issue is overdue.
 * Completed issues are NEVER classified as overdue.
 * Handles missing or invalid dates safely.
 *
 * @param {Date|string|null} dueDate
 * @param {string} status
 * @param {Date} [referenceDate] - defaults to now
 * @returns {boolean}
 */
export function isIssueOverdue(dueDate, status, referenceDate = new Date()) {
  if (!dueDate || status === STATUSES.DONE) {
    return false;
  }

  const due = new Date(dueDate);
  if (isNaN(due.getTime())) {
    return false;
  }

  return due.getTime() < referenceDate.getTime();
}

/**
 * Checks whether an issue has an upcoming deadline (within next N days).
 *
 * @param {Date|string|null} dueDate
 * @param {string} status
 * @param {number} [daysAhead=3]
 * @param {Date} [referenceDate]
 * @returns {boolean}
 */
export function isUpcomingDeadline(dueDate, status, daysAhead = 3, referenceDate = new Date()) {
  if (!dueDate || status === STATUSES.DONE) {
    return false;
  }

  const due = new Date(dueDate);
  if (isNaN(due.getTime())) {
    return false;
  }

  const now = referenceDate.getTime();
  const dueTime = due.getTime();

  if (dueTime < now) {
    return false; // Already overdue
  }

  const diffHours = (dueTime - now) / (1000 * 60 * 60);
  return diffHours <= daysAhead * 24;
}

/**
 * Calculates the urgency score (0-120+) and categorical urgency level for an issue.
 * 
 * Scoring Formula:
 * 1. Base Priority:
 *    - Critical: 50
 *    - High: 35
 *    - Medium: 20
 *    - Low: 10
 * 2. Overdue & Due Date Proximity (Non-Done only):
 *    - Overdue: +40
 *    - Due within 24 hours: +30
 *    - Due within 3 days (72h): +20
 *    - Due within 7 days: +10
 * 3. Blocked status:
 *    - Blocked: +15
 * 4. Stagnation in 'In Progress':
 *    - In Progress > 7 days: +15
 *    - In Progress > 3 days: +10
 *    - In Progress <= 3 days: +5
 *
 * Done items are assigned score 0 and level 'Low'.
 *
 * @param {Object} issue
 * @param {Date} [referenceDate]
 * @returns {{ score: number, level: string, isOverdue: boolean, isUpcoming: boolean }}
 */
export function calculateUrgency(issue, referenceDate = new Date()) {
  if (!issue) {
    return { score: 0, level: URGENCY_LEVELS.LOW, isOverdue: false, isUpcoming: false };
  }

  const status = issue.status || STATUSES.BACKLOG;
  const priority = issue.priority || PRIORITIES.MEDIUM;
  const dueDate = issue.dueDate ? new Date(issue.dueDate) : null;
  const isBlocked = Boolean(issue.isBlocked);

  // If issue is resolved/Done, urgency is cleared
  if (status === STATUSES.DONE) {
    return {
      score: 0,
      level: URGENCY_LEVELS.LOW,
      isOverdue: false,
      isUpcoming: false,
    };
  }

  let score = 0;

  // 1. Base Priority Score
  switch (priority) {
    case PRIORITIES.CRITICAL:
      score += 50;
      break;
    case PRIORITIES.HIGH:
      score += 35;
      break;
    case PRIORITIES.MEDIUM:
      score += 20;
      break;
    case PRIORITIES.LOW:
    default:
      score += 10;
      break;
  }

  // 2. Overdue & Proximity Score
  let overdue = false;
  let upcoming = false;

  if (dueDate && !isNaN(dueDate.getTime())) {
    const now = referenceDate.getTime();
    const dueTime = dueDate.getTime();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      overdue = true;
      score += 40; // Substantial penalty for overdue work
    } else if (diffHours <= 24) {
      upcoming = true;
      score += 30; // Due today/tomorrow
    } else if (diffHours <= 72) {
      upcoming = true;
      score += 20; // Due within 3 days
    } else if (diffHours <= 168) {
      score += 10; // Due within 7 days
    }
  }

  // 3. Blocked status bonus
  if (isBlocked) {
    score += 15;
  }

  // 4. In Progress stagnation
  if (status === STATUSES.IN_PROGRESS) {
    const updatedAt = issue.updatedAt ? new Date(issue.updatedAt) : new Date(issue.createdAt || referenceDate);
    if (!isNaN(updatedAt.getTime())) {
      const hoursSinceUpdate = (referenceDate.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate > 168) {
        score += 15; // In progress with no updates for over a week
      } else if (hoursSinceUpdate > 72) {
        score += 10; // In progress for > 3 days
      } else {
        score += 5; // Actively in progress
      }
    } else {
      score += 5;
    }
  }

  // Determine Categorical Level
  let level = URGENCY_LEVELS.LOW;
  if (score >= 75) {
    level = URGENCY_LEVELS.CRITICAL;
  } else if (score >= 50) {
    level = URGENCY_LEVELS.HIGH;
  } else if (score >= 30) {
    level = URGENCY_LEVELS.MEDIUM;
  } else {
    level = URGENCY_LEVELS.LOW;
  }

  return {
    score,
    level,
    isOverdue: overdue,
    isUpcoming: upcoming,
  };
}

/**
 * Enriches an issue with calculated fields (urgency score, level, isOverdue, isUpcoming).
 *
 * @param {Object} issue
 * @param {Date} [referenceDate]
 * @returns {Object}
 */
export function enrichIssue(issue, referenceDate = new Date()) {
  const plain = issue && typeof issue.toObject === 'function' ? issue.toObject() : { ...issue };
  const urgencyData = calculateUrgency(plain, referenceDate);
  return {
    ...plain,
    urgencyScore: urgencyData.score,
    urgencyLevel: urgencyData.level,
    isOverdue: urgencyData.isOverdue,
    isUpcoming: urgencyData.isUpcoming,
  };
}

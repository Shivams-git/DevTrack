import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateUrgency,
  isIssueOverdue,
  isUpcomingDeadline,
} from '../services/prioritizationEngine.js';
import { STATUSES, PRIORITIES, URGENCY_LEVELS } from '../utils/constants.js';

test('Prioritization Engine - Overdue detection', () => {
  const ref = new Date('2026-10-27T12:00:00Z');

  // Past due date
  const pastDue = new Date('2026-10-26T12:00:00Z');
  assert.equal(isIssueOverdue(pastDue, STATUSES.IN_PROGRESS, ref), true);

  // Future due date
  const futureDue = new Date('2026-10-28T12:00:00Z');
  assert.equal(isIssueOverdue(futureDue, STATUSES.IN_PROGRESS, ref), false);

  // Completed issues must NEVER be classified as overdue
  assert.equal(isIssueOverdue(pastDue, STATUSES.DONE, ref), false);

  // Null, undefined, or invalid dates must be safely handled
  assert.equal(isIssueOverdue(null, STATUSES.TODO, ref), false);
  assert.equal(isIssueOverdue('invalid-date-string', STATUSES.TODO, ref), false);
});

test('Prioritization Engine - Upcoming deadline detection', () => {
  const ref = new Date('2026-10-27T12:00:00Z');

  // Due in 24 hours
  const dueTomorrow = new Date('2026-10-28T12:00:00Z');
  assert.equal(isUpcomingDeadline(dueTomorrow, STATUSES.TODO, 3, ref), true);

  // Due in 5 days (beyond 3-day threshold)
  const dueLater = new Date('2026-11-01T12:00:00Z');
  assert.equal(isUpcomingDeadline(dueLater, STATUSES.TODO, 3, ref), false);

  // Done issues should not flag as upcoming deadline
  assert.equal(isUpcomingDeadline(dueTomorrow, STATUSES.DONE, 3, ref), false);
});

test('Prioritization Engine - Priority weighting rules', () => {
  const ref = new Date('2026-10-27T12:00:00Z');

  const critical = calculateUrgency({ priority: PRIORITIES.CRITICAL, status: STATUSES.TODO }, ref);
  const low = calculateUrgency({ priority: PRIORITIES.LOW, status: STATUSES.TODO }, ref);

  assert.ok(
    critical.score > low.score,
    `Critical score (${critical.score}) should exceed Low score (${low.score})`
  );
  assert.equal(critical.score, 50);
  assert.equal(low.score, 10);
});

test('Prioritization Engine - Overdue unfinished issues receive substantial urgency increase', () => {
  const ref = new Date('2026-10-27T12:00:00Z');
  const pastDue = new Date('2026-10-25T12:00:00Z');

  const onTrack = calculateUrgency({ priority: PRIORITIES.MEDIUM, status: STATUSES.TODO }, ref);
  const overdue = calculateUrgency(
    { priority: PRIORITIES.MEDIUM, status: STATUSES.TODO, dueDate: pastDue },
    ref
  );

  // Overdue issue receives +40 points
  assert.equal(overdue.score, onTrack.score + 40);
  assert.equal(overdue.isOverdue, true);
  assert.equal(overdue.level, URGENCY_LEVELS.HIGH);
});

test('Prioritization Engine - Blocked issues receive urgency boost', () => {
  const ref = new Date('2026-10-27T12:00:00Z');

  const unblocked = calculateUrgency({ priority: PRIORITIES.HIGH, status: STATUSES.IN_PROGRESS, isBlocked: false }, ref);
  const blocked = calculateUrgency({ priority: PRIORITIES.HIGH, status: STATUSES.IN_PROGRESS, isBlocked: true }, ref);

  assert.equal(blocked.score, unblocked.score + 15);
});

test('Prioritization Engine - Done issues are cleared of urgency', () => {
  const ref = new Date('2026-10-27T12:00:00Z');
  const pastDue = new Date('2026-10-20T12:00:00Z');

  const completed = calculateUrgency(
    {
      priority: PRIORITIES.CRITICAL,
      status: STATUSES.DONE,
      dueDate: pastDue,
      isBlocked: true,
    },
    ref
  );

  assert.equal(completed.score, 0);
  assert.equal(completed.level, URGENCY_LEVELS.LOW);
  assert.equal(completed.isOverdue, false);
});

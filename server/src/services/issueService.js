import mongoose from 'mongoose';
import { Issue } from '../models/Issue.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from './memoryStore.js';
import { enrichIssue, isIssueOverdue, isUpcomingDeadline } from './prioritizationEngine.js';
import { logActivity } from './activityService.js';
import { STATUSES, PRIORITIES, ACTIVITY_ACTIONS } from '../utils/constants.js';

/**
 * Generate next sequential issue key (e.g., DEV-015)
 * Inspects all existing issue keys to reliably determine the true maximum number.
 */
async function generateNextKey() {
  if (isDbConnected()) {
    const issues = await Issue.find({}, { key: 1 }).lean();
    let maxNum = 0;
    for (const item of issues) {
      if (item.key) {
        const match = item.key.match(/DEV-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    let nextNum = maxNum + 1;
    let candidate = `DEV-${String(nextNum).padStart(3, '0')}`;
    while (await Issue.exists({ key: candidate })) {
      nextNum++;
      candidate = `DEV-${String(nextNum).padStart(3, '0')}`;
    }
    return candidate;
  } else {
    return memoryStore.generateKey();
  }
}

/**
 * Resolve query filter for MongoDB ObjectId or Key
 */
function resolveIdQuery(idOrKey) {
  if (mongoose.Types.ObjectId.isValid(idOrKey)) {
    return { _id: idOrKey };
  }
  return { key: String(idOrKey).toUpperCase() };
}

export async function getAllIssues(params = {}) {
  const { search, status, priority, type, sort = 'updatedAt', order = 'desc', page = 1, limit = 50 } = params;

  if (!isDbConnected()) {
    const res = memoryStore.findIssues(params);
    const enriched = res.issues.map((i) => enrichIssue(i));
    return { ...res, issues: enriched };
  }

  const query = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [{ title: regex }, { description: regex }, { key: regex }];
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  if (priority && priority !== 'All') {
    query.priority = priority;
  }

  if (type && type !== 'All') {
    query.type = type;
  }

  const sortDirection = order === 'asc' ? 1 : -1;
  const sortObj = {};
  if (sort === 'priority') {
    // Custom sort or standard string sort
    sortObj.priority = sortDirection;
  } else if (sort === 'dueDate') {
    sortObj.dueDate = sortDirection;
  } else {
    sortObj[sort] = sortDirection;
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [rawIssues, total] = await Promise.all([
    Issue.find(query).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
    Issue.countDocuments(query),
  ]);

  const issues = rawIssues.map((i) => enrichIssue(i));

  // If sorting by urgency, sort enriched issues
  if (sort === 'urgency') {
    issues.sort((a, b) => (sortDirection === 1 ? a.urgencyScore - b.urgencyScore : b.urgencyScore - a.urgencyScore));
  }

  return {
    issues,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
  };
}

export async function getIssueById(idOrKey) {
  let issue = null;
  if (isDbConnected()) {
    issue = await Issue.findOne(resolveIdQuery(idOrKey)).lean();
  } else {
    issue = memoryStore.findIssueById(idOrKey);
  }

  if (!issue) return null;
  return enrichIssue(issue);
}

export async function createIssue(data) {
  const key = data.key || (await generateNextKey());
  const payload = {
    ...data,
    key,
  };

  let newIssue;
  if (isDbConnected()) {
    const doc = await Issue.create(payload);
    newIssue = doc.toObject();
  } else {
    newIssue = memoryStore.createIssue(payload);
  }

  const enriched = enrichIssue(newIssue);

  await logActivity({
    action: ACTIVITY_ACTIONS.ISSUE_CREATED,
    description: `Created issue ${key}: "${enriched.title}" with priority ${enriched.priority}`,
    issueKey: key,
    metadata: { key, title: enriched.title, priority: enriched.priority, status: enriched.status },
  });

  return enriched;
}

export async function updateIssue(idOrKey, updates) {
  const existing = await getIssueById(idOrKey);
  if (!existing) return null;

  let updatedIssue;
  if (isDbConnected()) {
    const doc = await Issue.findOneAndUpdate(
      resolveIdQuery(idOrKey),
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    updatedIssue = doc;
  } else {
    updatedIssue = memoryStore.updateIssue(idOrKey, updates);
  }

  if (!updatedIssue) return null;

  const enriched = enrichIssue(updatedIssue);

  // Record specific activities based on what changed
  if (updates.status && updates.status !== existing.status) {
    await logActivity({
      action: ACTIVITY_ACTIONS.STATUS_CHANGED,
      description: `Moved ${enriched.key} from ${existing.status} to ${updates.status}`,
      issueKey: enriched.key,
      metadata: { from: existing.status, to: updates.status },
    });
  } else if (updates.priority && updates.priority !== existing.priority) {
    await logActivity({
      action: ACTIVITY_ACTIONS.PRIORITY_CHANGED,
      description: `Updated priority of ${enriched.key} from ${existing.priority} to ${updates.priority}`,
      issueKey: enriched.key,
      metadata: { from: existing.priority, to: updates.priority },
    });
  } else {
    await logActivity({
      action: ACTIVITY_ACTIONS.ISSUE_UPDATED,
      description: `Updated details for ${enriched.key} ("${enriched.title}")`,
      issueKey: enriched.key,
      metadata: { updates },
    });
  }

  return enriched;
}

export async function deleteIssue(idOrKey) {
  const existing = await getIssueById(idOrKey);
  if (!existing) return null;

  let deleted;
  if (isDbConnected()) {
    deleted = await Issue.findOneAndDelete(resolveIdQuery(idOrKey)).lean();
  } else {
    deleted = memoryStore.deleteIssue(idOrKey);
  }

  if (deleted) {
    await logActivity({
      action: ACTIVITY_ACTIONS.ISSUE_DELETED,
      description: `Deleted issue ${existing.key} ("${existing.title}")`,
      issueKey: existing.key,
      metadata: { key: existing.key, title: existing.title },
    });
  }

  return deleted;
}

export async function getDashboardData() {
  let allIssues = [];
  if (isDbConnected()) {
    allIssues = await Issue.find().sort({ updatedAt: -1 }).lean();
  } else {
    allIssues = memoryStore.issues;
  }

  const enriched = allIssues.map((i) => enrichIssue(i));

  const total = enriched.length;
  const completed = enriched.filter((i) => i.status === STATUSES.DONE).length;
  const inProgress = enriched.filter((i) => i.status === STATUSES.IN_PROGRESS).length;
  const overdue = enriched.filter((i) => i.isOverdue).length;
  const blocked = enriched.filter((i) => i.isBlocked && i.status !== STATUSES.DONE).length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Status breakdown
  const statusCounts = Object.values(STATUSES).reduce((acc, status) => {
    acc[status] = enriched.filter((i) => i.status === status).length;
    return acc;
  }, {});

  // Priority breakdown
  const priorityCounts = Object.values(PRIORITIES).reduce((acc, priority) => {
    acc[priority] = enriched.filter((i) => i.priority === priority).length;
    return acc;
  }, {});

  // Urgent work: non-Done items sorted by urgency score desc
  const urgentTasks = enriched
    .filter((i) => i.status !== STATUSES.DONE && (i.urgencyScore >= 30 || i.isBlocked || i.isOverdue))
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 5);

  // Upcoming deadlines: non-Done issues with due dates in future
  const upcomingDeadlines = enriched
    .filter((i) => i.status !== STATUSES.DONE && i.dueDate && !i.isOverdue)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Recently updated issues
  const recentlyUpdated = [...enriched]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return {
    metrics: {
      total,
      completed,
      inProgress,
      overdue,
      blocked,
      completionPercentage,
    },
    statusCounts,
    priorityCounts,
    urgentTasks,
    upcomingDeadlines,
    recentlyUpdated,
  };
}

export async function getInsightsData() {
  let allIssues = [];
  if (isDbConnected()) {
    allIssues = await Issue.find().lean();
  } else {
    allIssues = memoryStore.issues;
  }

  const enriched = allIssues.map((i) => enrichIssue(i));
  const total = enriched.length;
  const completed = enriched.filter((i) => i.status === STATUSES.DONE).length;
  const overdue = enriched.filter((i) => i.isOverdue).length;
  const inProgress = enriched.filter((i) => i.status === STATUSES.IN_PROGRESS).length;

  // Type Breakdown
  const typeMap = {};
  enriched.forEach((issue) => {
    typeMap[issue.type] = (typeMap[issue.type] || 0) + 1;
  });

  const typeDistribution = Object.keys(typeMap).map((type) => ({
    name: type,
    count: typeMap[type],
  }));

  // Status Distribution
  const statusDistribution = Object.values(STATUSES).map((status) => ({
    name: status,
    count: enriched.filter((i) => i.status === status).length,
  }));

  // Priority Distribution
  const priorityDistribution = Object.values(PRIORITIES).map((priority) => ({
    name: priority,
    count: enriched.filter((i) => i.priority === priority).length,
  }));

  // Workload / Estimated hours
  const totalEstimatedHours = enriched.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);
  const completedEstimatedHours = enriched
    .filter((i) => i.status === STATUSES.DONE)
    .reduce((sum, i) => sum + (i.estimatedHours || 0), 0);

  return {
    total,
    completed,
    overdue,
    inProgress,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalEstimatedHours,
    completedEstimatedHours,
    statusDistribution,
    priorityDistribution,
    typeDistribution,
  };
}

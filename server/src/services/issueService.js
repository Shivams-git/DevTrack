import mongoose from 'mongoose';
import { Issue } from '../models/Issue.js';
import { Activity } from '../models/Activity.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from './memoryStore.js';
import { enrichIssue, isIssueOverdue, isUpcomingDeadline } from './prioritizationEngine.js';
import { logActivity } from './activityService.js';
import { STATUSES, PRIORITIES, ACTIVITY_ACTIONS } from '../utils/constants.js';
import { sampleIssues } from '../scripts/seedData.js';

export async function ensureDemoIssuesExist() {
  if (isDbConnected()) {
    const demoCount = await Issue.countDocuments({ isDemo: true });
    if (demoCount === 0) {
      // Mark any legacy unassigned issues as demo
      await Issue.updateMany(
        { $or: [{ userId: null }, { userId: { $exists: false } }] },
        { $set: { isDemo: true } }
      );
      await Activity.updateMany(
        { $or: [{ userId: null }, { userId: { $exists: false } }] },
        { $set: { isDemo: true } }
      );

      const refreshedCount = await Issue.countDocuments({ isDemo: true });
      if (refreshedCount === 0) {
        for (const item of sampleIssues) {
          await Issue.findOneAndUpdate(
            { key: item.key },
            { $set: { ...item, isDemo: true, userId: null } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
        const recentSample = sampleIssues.slice(0, 5);
        for (const item of recentSample) {
          await Activity.create({
            action: ACTIVITY_ACTIONS.ISSUE_CREATED,
            description: `Created issue ${item.key}: "${item.title}" [${item.priority}]`,
            issueKey: item.key,
            metadata: { status: item.status, priority: item.priority },
            createdAt: item.createdAt,
            isDemo: true,
            userId: null,
          });
        }
      }
    }
  } else {
    if (memoryStore.issues.filter((i) => i.isDemo === true).length === 0) {
      memoryStore.seedDemoIssues();
    }
  }
}

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

/**
 * Build MongoDB user/demo scoping filter
 */
export function buildUserQuery(user = null, isTestMode = false) {
  if (isTestMode) {
    return { isDemo: true };
  }
  if (user?.id) {
    return { userId: user.id, isDemo: { $ne: true } };
  }
  // Guest user in standard mode: empty by matching unassigned non-demo issues
  return { userId: null, isDemo: { $ne: true } };
}

export async function getAllIssues(params = {}, user = null, isTestMode = false) {
  const { search, status, priority, type, sort = 'updatedAt', order = 'desc', page = 1, limit = 50 } = params;

  if (isTestMode) {
    await ensureDemoIssuesExist();
  }

  if (!isDbConnected()) {
    const res = memoryStore.findIssues(params, user, isTestMode);
    const enriched = res.issues.map((i) => enrichIssue(i));
    return { ...res, issues: enriched };
  }

  const userQuery = buildUserQuery(user, isTestMode);
  const query = { ...userQuery };

  if (search) {
    const trimmed = String(search).trim();
    // Allow matching "dev - 001" or "dev 001" to "DEV-001"
    const flexibleKey = trimmed.replace(/[\s-_]+/g, '[-_ ]?');
    const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const keyRegex = new RegExp(flexibleKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ title: regex }, { description: regex }, { key: keyRegex }, { labels: regex }];
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

export async function getIssueById(idOrKey, user = null, isTestMode = false) {
  const baseQuery = resolveIdQuery(idOrKey);
  const userQuery = buildUserQuery(user, isTestMode);

  let issue = null;
  if (isDbConnected()) {
    issue = await Issue.findOne({ ...baseQuery, ...userQuery }).lean();
    if (!issue && !isTestMode && user?.id) {
      // Check fallback if queried by direct ObjectId
      const direct = await Issue.findOne(baseQuery).lean();
      if (direct && (!direct.userId || direct.userId.toString() === user.id.toString())) {
        issue = direct;
      }
    }
  } else {
    issue = memoryStore.findIssueById(idOrKey, user, isTestMode);
  }

  if (!issue) return null;
  return enrichIssue(issue);
}

export async function createIssue(data, user = null, isTestMode = false) {
  let key = data.key ? String(data.key).trim().toUpperCase() : '';
  if (!key) {
    key = await generateNextKey();
  } else {
    const exists = isDbConnected()
      ? await Issue.exists({ key })
      : memoryStore.issues.some((i) => i.key === key);
    if (exists) {
      const err = new Error(`Issue identifier "${key}" is already in use. Please choose a different identifier or leave it empty to auto-generate.`);
      err.statusCode = 409;
      throw err;
    }
  }

  const payload = {
    ...data,
    key,
    userId: user?.id ? user.id : null,
    isDemo: Boolean(isTestMode),
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
    userId: user?.id || null,
    isDemo: Boolean(isTestMode),
  });

  return enriched;
}

export async function updateIssue(idOrKey, updates, user = null, isTestMode = false) {
  const existing = await getIssueById(idOrKey, user, isTestMode);
  if (!existing) return null;

  if (updates.key) {
    updates.key = String(updates.key).trim().toUpperCase();
    if (updates.key !== existing.key) {
      const exists = isDbConnected()
        ? await Issue.exists({ key: updates.key })
        : memoryStore.issues.some((i) => i.key === updates.key);
      if (exists) {
        const err = new Error(`Issue identifier "${updates.key}" is already in use. Please choose a different identifier.`);
        err.statusCode = 409;
        throw err;
      }
    }
  }

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
      userId: user?.id || null,
      isDemo: Boolean(isTestMode),
    });
  } else if (updates.priority && updates.priority !== existing.priority) {
    await logActivity({
      action: ACTIVITY_ACTIONS.PRIORITY_CHANGED,
      description: `Updated priority of ${enriched.key} from ${existing.priority} to ${updates.priority}`,
      issueKey: enriched.key,
      metadata: { from: existing.priority, to: updates.priority },
      userId: user?.id || null,
      isDemo: Boolean(isTestMode),
    });
  } else {
    await logActivity({
      action: ACTIVITY_ACTIONS.ISSUE_UPDATED,
      description: `Updated details for ${enriched.key} ("${enriched.title}")`,
      issueKey: enriched.key,
      metadata: { updates },
      userId: user?.id || null,
      isDemo: Boolean(isTestMode),
    });
  }

  return enriched;
}

export async function deleteIssue(idOrKey, user = null, isTestMode = false) {
  const existing = await getIssueById(idOrKey, user, isTestMode);
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
      userId: user?.id || null,
      isDemo: Boolean(isTestMode),
    });
  }

  return deleted;
}

export async function getDashboardData(user = null, isTestMode = false) {
  if (isTestMode) {
    await ensureDemoIssuesExist();
  }
  const userQuery = buildUserQuery(user, isTestMode);
  let allIssues = [];
  if (isDbConnected()) {
    allIssues = await Issue.find(userQuery).sort({ updatedAt: -1 }).lean();
  } else {
    const res = memoryStore.findIssues({ limit: 1000 }, user, isTestMode);
    allIssues = res.issues;
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
    isTestMode,
  };
}

export async function getInsightsData(user = null, isTestMode = false) {
  if (isTestMode) {
    await ensureDemoIssuesExist();
  }
  const userQuery = buildUserQuery(user, isTestMode);
  let allIssues = [];
  if (isDbConnected()) {
    allIssues = await Issue.find(userQuery).lean();
  } else {
    const res = memoryStore.findIssues({ limit: 1000 }, user, isTestMode);
    allIssues = res.issues;
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
    isTestMode,
  };
}

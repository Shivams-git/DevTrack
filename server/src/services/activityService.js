import { Activity } from '../models/Activity.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from './memoryStore.js';
import { logger } from '../utils/logger.js';

export async function logActivity({ action, description, issueKey = '', metadata = {}, userId = null, isDemo = false }) {
  try {
    if (isDbConnected()) {
      const record = await Activity.create({
        action,
        description,
        issueKey,
        metadata,
        userId: userId || null,
        isDemo: Boolean(isDemo),
      });
      return record;
    } else {
      return memoryStore.recordActivity({ action, description, issueKey, metadata, userId, isDemo });
    }
  } catch (error) {
    logger.error('Failed to log activity:', error.message);
    // Don't crash the main operation if activity logging encounters an issue
    return null;
  }
}

export async function getActivities(limit = 30, user = null, isTestMode = false) {
  if (isDbConnected()) {
    let filter = {};
    if (isTestMode) {
      filter = { isDemo: true };
    } else if (user?.id) {
      filter = { userId: user.id, isDemo: { $ne: true } };
    } else {
      filter = { userId: null, isDemo: { $ne: true } };
    }
    return Activity.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  }
  return memoryStore.findActivities(limit, user, isTestMode);
}

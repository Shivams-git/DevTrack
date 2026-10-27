import { Activity } from '../models/Activity.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from './memoryStore.js';
import { logger } from '../utils/logger.js';

export async function logActivity({ action, description, issueKey = '', metadata = {} }) {
  try {
    if (isDbConnected()) {
      const record = await Activity.create({
        action,
        description,
        issueKey,
        metadata,
      });
      return record;
    } else {
      return memoryStore.recordActivity({ action, description, issueKey, metadata });
    }
  } catch (error) {
    logger.error('Failed to log activity:', error.message);
    // Don't crash the main operation if activity logging encounters an issue
    return null;
  }
}

export async function getActivities(limit = 30) {
  if (isDbConnected()) {
    return Activity.find().sort({ createdAt: -1 }).limit(limit).lean();
  }
  return memoryStore.findActivities(limit);
}

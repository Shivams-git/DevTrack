import * as activityService from '../services/activityService.js';

export async function getActivityFeed(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const isTestMode = req.headers['x-test-mode'] === 'true' || req.query.testMode === 'true';
    const activities = await activityService.getActivities(limit, req.user || null, isTestMode);
    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
}

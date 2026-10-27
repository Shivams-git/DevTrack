import * as activityService from '../services/activityService.js';

export async function getActivityFeed(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const activities = await activityService.getActivities(limit);
    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
}

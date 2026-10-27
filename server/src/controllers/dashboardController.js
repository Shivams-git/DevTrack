import * as issueService from '../services/issueService.js';

export async function getDashboard(req, res, next) {
  try {
    const isTestMode = req.headers['x-test-mode'] === 'true' || req.query.testMode === 'true';
    const data = await issueService.getDashboardData(req.user || null, isTestMode);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

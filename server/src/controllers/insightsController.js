import * as issueService from '../services/issueService.js';

export async function getInsights(req, res, next) {
  try {
    const isTestMode = req.headers['x-test-mode'] === 'true' || req.query.testMode === 'true';
    const data = await issueService.getInsightsData(req.user || null, isTestMode);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

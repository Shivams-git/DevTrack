import * as issueService from '../services/issueService.js';

export async function getInsights(req, res, next) {
  try {
    const data = await issueService.getInsightsData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

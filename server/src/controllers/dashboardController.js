import * as issueService from '../services/issueService.js';

export async function getDashboard(req, res, next) {
  try {
    const data = await issueService.getDashboardData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

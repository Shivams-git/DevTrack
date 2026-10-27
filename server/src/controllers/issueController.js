import * as issueService from '../services/issueService.js';

export async function getIssues(req, res, next) {
  try {
    const { search, status, priority, type, sort, order, page, limit } = req.query;
    const result = await issueService.getAllIssues({
      search,
      status,
      priority,
      type,
      sort,
      order,
      page,
      limit,
    });
    res.json({
      success: true,
      data: result.issues,
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getIssueById(req, res, next) {
  try {
    const issue = await issueService.getIssueById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: `Issue not found: ${req.params.id}`,
      });
    }
    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
}

export async function createIssue(req, res, next) {
  try {
    const created = await issueService.createIssue(req.body);
    res.status(201).json({
      success: true,
      data: created,
      message: `Issue ${created.key} created successfully`,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateIssue(req, res, next) {
  try {
    const updated = await issueService.updateIssue(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Issue not found: ${req.params.id}`,
      });
    }
    res.json({
      success: true,
      data: updated,
      message: `Issue ${updated.key} updated successfully`,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteIssue(req, res, next) {
  try {
    const deleted = await issueService.deleteIssue(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Issue not found: ${req.params.id}`,
      });
    }
    res.json({
      success: true,
      data: { id: req.params.id },
      message: `Issue deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
}

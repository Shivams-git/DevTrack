import { STATUS_LIST, PRIORITY_LIST, TYPE_LIST } from '../utils/constants.js';

export function validateCreateIssue(req, res, next) {
  const { title, type, status, priority, dueDate, estimatedHours, isBlocked, blockingReason } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Title is required and must be at least 3 characters long',
    });
  }

  if (title.trim().length > 150) {
    return res.status(400).json({
      success: false,
      error: 'Title cannot exceed 150 characters',
    });
  }

  if (type && !TYPE_LIST.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid type. Allowed values: ${TYPE_LIST.join(', ')}`,
    });
  }

  if (status && !STATUS_LIST.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Allowed values: ${STATUS_LIST.join(', ')}`,
    });
  }

  if (priority && !PRIORITY_LIST.includes(priority)) {
    return res.status(400).json({
      success: false,
      error: `Invalid priority. Allowed values: ${PRIORITY_LIST.join(', ')}`,
    });
  }

  if (dueDate) {
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid due date format',
      });
    }
  }

  if (estimatedHours !== undefined && estimatedHours !== null && estimatedHours !== '') {
    const hours = Number(estimatedHours);
    if (isNaN(hours) || hours < 0) {
      return res.status(400).json({
        success: false,
        error: 'Estimated hours must be a non-negative number',
      });
    }
  }

  if (isBlocked && (!blockingReason || !blockingReason.trim())) {
    // Helpful advisory check or error
  }

  next();
}

export function validateUpdateIssue(req, res, next) {
  const { title, type, status, priority, dueDate, estimatedHours } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Title must be at least 3 characters long',
      });
    }
    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        error: 'Title cannot exceed 150 characters',
      });
    }
  }

  if (type !== undefined && !TYPE_LIST.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid type. Allowed values: ${TYPE_LIST.join(', ')}`,
    });
  }

  if (status !== undefined && !STATUS_LIST.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Allowed values: ${STATUS_LIST.join(', ')}`,
    });
  }

  if (priority !== undefined && !PRIORITY_LIST.includes(priority)) {
    return res.status(400).json({
      success: false,
      error: `Invalid priority. Allowed values: ${PRIORITY_LIST.join(', ')}`,
    });
  }

  if (dueDate) {
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid due date format',
      });
    }
  }

  if (estimatedHours !== undefined && estimatedHours !== null && estimatedHours !== '') {
    const hours = Number(estimatedHours);
    if (isNaN(hours) || hours < 0) {
      return res.status(400).json({
        success: false,
        error: 'Estimated hours must be a non-negative number',
      });
    }
  }

  next();
}

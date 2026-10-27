import { STATUSES, PRIORITIES, TYPES } from '../utils/constants.js';

class MemoryStore {
  constructor() {
    this.issues = [];
    this.activities = [];
    this.counter = 1;
  }

  generateKey() {
    let maxNum = 0;
    for (const item of this.issues) {
      if (item.key) {
        const match = item.key.match(/DEV-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
    let nextNum = Math.max(maxNum + 1, this.counter);
    let candidate = `DEV-${String(nextNum).padStart(3, '0')}`;
    while (this.issues.some((i) => i.key === candidate)) {
      nextNum++;
      candidate = `DEV-${String(nextNum).padStart(3, '0')}`;
    }
    this.counter = nextNum + 1;
    return candidate;
  }

  reset() {
    this.issues = [];
    this.activities = [];
    this.counter = 1;
  }

  findIssues({ search, status, priority, type, sort = 'updatedAt', order = 'desc', page = 1, limit = 50 } = {}) {
    let result = [...this.issues];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.key?.toLowerCase().includes(q) ||
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All') {
      result = result.filter((i) => i.status === status);
    }

    if (priority && priority !== 'All') {
      result = result.filter((i) => i.priority === priority);
    }

    if (type && type !== 'All') {
      result = result.filter((i) => i.type === type);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];

      if (sort === 'dueDate') {
        valA = valA ? new Date(valA).getTime() : Infinity;
        valB = valB ? new Date(valB).getTime() : Infinity;
      } else if (sort === 'createdAt' || sort === 'updatedAt') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      issues: paginated,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit) || 1,
    };
  }

  findIssueById(idOrKey) {
    return this.issues.find((i) => i._id === idOrKey || i.id === idOrKey || i.key === idOrKey) || null;
  }

  createIssue(data) {
    const now = new Date();
    const id = 'mem_' + Math.random().toString(36).substring(2, 9);
    const key = data.key || this.generateKey();

    const newIssue = {
      _id: id,
      id,
      key,
      title: data.title,
      description: data.description || '',
      type: data.type || TYPES.TASK,
      status: data.status || STATUSES.BACKLOG,
      priority: data.priority || PRIORITIES.MEDIUM,
      labels: Array.isArray(data.labels) ? data.labels : [],
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : null,
      isBlocked: Boolean(data.isBlocked),
      blockingReason: data.blockingReason || '',
      createdAt: now,
      updatedAt: now,
    };

    this.issues.unshift(newIssue);
    return newIssue;
  }

  updateIssue(idOrKey, updates) {
    const index = this.issues.findIndex((i) => i._id === idOrKey || i.id === idOrKey || i.key === idOrKey);
    if (index === -1) return null;

    const existing = this.issues[index];
    const updated = {
      ...existing,
      ...updates,
      _id: existing._id,
      id: existing.id,
      key: existing.key,
      updatedAt: new Date(),
    };

    if (updates.dueDate !== undefined) {
      updated.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }

    this.issues[index] = updated;
    return updated;
  }

  deleteIssue(idOrKey) {
    const index = this.issues.findIndex((i) => i._id === idOrKey || i.id === idOrKey || i.key === idOrKey);
    if (index === -1) return null;
    const [deleted] = this.issues.splice(index, 1);
    return deleted;
  }

  recordActivity({ action, description, issueKey, metadata = {} }) {
    const activity = {
      _id: 'act_' + Math.random().toString(36).substring(2, 9),
      action,
      description,
      issueKey: issueKey || '',
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.activities.unshift(activity);
    return activity;
  }

  findActivities(limit = 30) {
    return this.activities.slice(0, limit);
  }
}

export const memoryStore = new MemoryStore();

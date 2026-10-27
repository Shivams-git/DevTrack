import bcrypt from 'bcryptjs';
import { STATUSES, PRIORITIES, TYPES } from '../utils/constants.js';
import { sampleIssues } from '../scripts/seedData.js';

class MemoryStore {
  constructor() {
    this.issues = [];
    this.activities = [];
    this.users = [];
    this.counter = 1;
    this.seedDemoUsers();
    this.seedDemoIssues();
  }

  seedDemoUsers() {
    // Valid bcrypt hash for 'password123'
    const defaultHash = bcrypt.hashSync('password123', 10);
    this.users = [
      {
        _id: 'user_alex_1',
        name: 'Alex Rivera',
        email: 'alex@devtrack.dev',
        password: defaultHash,
        role: 'tech_lead',
        team: 'Platform Architecture',
        bio: 'Tech Lead focusing on developer productivity and cloud infrastructure.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex@devtrack.dev',
        theme: 'tokyo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'user_sarah_2',
        name: 'Sarah Chen',
        email: 'sarah@devtrack.dev',
        password: defaultHash,
        role: 'developer',
        team: 'Frontend Systems',
        bio: 'Senior full-stack engineer building intuitive UI/UX systems.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah@devtrack.dev',
        theme: 'tokyo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findUserById(id) {
    if (!id) return null;
    return this.users.find((u) => u._id === id || u.id === id) || null;
  }

  createUser(userData) {
    const user = {
      _id: 'user_' + Math.random().toString(36).substring(2, 9),
      theme: 'tokyo',
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date() });
    return user;
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

  seedDemoIssues() {
    for (const item of sampleIssues) {
      if (!this.issues.some((i) => i.key === item.key)) {
        this.issues.push({
          _id: 'demo_' + item.key.toLowerCase(),
          ...item,
          isDemo: true,
          userId: null,
          createdAt: item.createdAt || new Date(),
          updatedAt: item.updatedAt || new Date(),
        });
      }
    }
    if (this.activities.filter((a) => a.isDemo === true).length === 0) {
      const recentSample = sampleIssues.slice(0, 5);
      for (const item of recentSample) {
        this.activities.push({
          _id: 'act_' + Math.random().toString(36).substring(2, 9),
          action: 'ISSUE_CREATED',
          description: `Created issue ${item.key}: "${item.title}" [${item.priority}]`,
          issueKey: item.key,
          metadata: { status: item.status, priority: item.priority },
          createdAt: item.createdAt || new Date(),
          isDemo: true,
          userId: null,
        });
      }
    }
  }

  reset() {
    this.issues = [];
    this.activities = [];
    this.counter = 1;
    this.seedDemoIssues();
  }

  findIssues({ search, status, priority, type, sort = 'updatedAt', order = 'desc', page = 1, limit = 50 } = {}, user = null, isTestMode = false) {
    if (isTestMode && this.issues.filter((i) => i.isDemo === true).length === 0) {
      this.seedDemoIssues();
    }
    let result = [...this.issues];

    // Filter by testMode or user
    if (isTestMode) {
      result = result.filter((i) => i.isDemo === true);
    } else if (user?.id) {
      result = result.filter((i) => (i.userId === user.id || i.userId === user._id) && !i.isDemo);
    } else {
      result = result.filter((i) => !i.userId && !i.isDemo);
    }

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

  findIssueById(idOrKey, user = null, isTestMode = false) {
    return (
      this.issues.find((i) => {
        const matchesKey = i._id === idOrKey || i.id === idOrKey || i.key === idOrKey;
        if (!matchesKey) return false;
        if (isTestMode) return i.isDemo === true;
        if (user?.id) return (i.userId === user.id || i.userId === user._id) && !i.isDemo;
        return !i.userId && !i.isDemo;
      }) || null
    );
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
      userId: data.userId || null,
      isDemo: Boolean(data.isDemo),
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
      key: updates.key ? updates.key.toUpperCase().trim() : existing.key,
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

  recordActivity({ action, description, issueKey, metadata = {}, userId = null, isDemo = false }) {
    const activity = {
      _id: 'act_' + Math.random().toString(36).substring(2, 9),
      action,
      description,
      issueKey: issueKey || '',
      metadata,
      userId: userId || null,
      isDemo: Boolean(isDemo),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.activities.unshift(activity);
    return activity;
  }

  findActivities(limit = 30, user = null, isTestMode = false) {
    let result = [...this.activities];
    if (isTestMode) {
      result = result.filter((a) => a.isDemo === true);
    } else if (user?.id) {
      result = result.filter((a) => (a.userId === user.id || a.userId === user._id) && !a.isDemo);
    } else {
      result = result.filter((a) => !a.userId && !a.isDemo);
    }
    return result.slice(0, limit);
  }
}

export const memoryStore = new MemoryStore();

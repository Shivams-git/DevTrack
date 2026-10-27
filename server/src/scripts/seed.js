import { connectDB, isDbConnected } from '../config/db.js';
import { Issue } from '../models/Issue.js';
import { Activity } from '../models/Activity.js';
import { User } from '../models/User.js';
import { sampleIssues } from './seedData.js';
import { memoryStore } from '../services/memoryStore.js';
import { logActivity } from '../services/activityService.js';
import { ACTIVITY_ACTIONS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export async function runSeed({ quiet = false } = {}) {
  if (!quiet) logger.info('Seeding DevTrack database with realistic developer issues and demo accounts...');

  const dbOk = await connectDB();

  if (dbOk && isDbConnected()) {
    // MongoDB mode
    await Issue.deleteMany({});
    await Activity.deleteMany({});

    // Seed or preserve users
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      await User.create([
        {
          name: 'Alex Rivera',
          email: 'alex@devtrack.dev',
          password: 'password123',
          role: 'tech_lead',
          team: 'Platform Architecture',
          bio: 'Tech Lead focusing on developer productivity, CI/CD, and distributed systems.',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex@devtrack.dev',
        },
        {
          name: 'Sarah Chen',
          email: 'sarah@devtrack.dev',
          password: 'password123',
          role: 'developer',
          team: 'Frontend Systems',
          bio: 'Senior full-stack engineer building high performance user interfaces.',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah@devtrack.dev',
        },
        {
          name: 'David Kim',
          email: 'david@devtrack.dev',
          password: 'password123',
          role: 'qa_engineer',
          team: 'Quality Engineering',
          bio: 'Lead automation & test engineer optimizing release reliability.',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=david@devtrack.dev',
        },
      ]);
      if (!quiet) logger.info('Seeded demo accounts in MongoDB Atlas (alex@devtrack.dev, sarah@devtrack.dev)!');
    }

    for (const item of sampleIssues) {
      await Issue.create({ ...item, isDemo: true, userId: null });
    }

    // Seed realistic activity records
    const recentSample = sampleIssues.slice(0, 5);
    for (const item of recentSample) {
      await Activity.create({
        action: ACTIVITY_ACTIONS.ISSUE_CREATED,
        description: `Created issue ${item.key}: "${item.title}" [${item.priority}]`,
        issueKey: item.key,
        metadata: { status: item.status, priority: item.priority },
        createdAt: item.createdAt,
        isDemo: true,
        userId: null,
      });
    }

    if (!quiet) logger.info(`Successfully seeded ${sampleIssues.length} issues and activity history in MongoDB!`);
    return { success: true, count: sampleIssues.length, mode: 'mongodb' };
  } else {
    // In-memory demo store mode
    memoryStore.reset();
    for (const item of sampleIssues) {
      memoryStore.createIssue({ ...item, isDemo: true, userId: null });
    }

    const recentSample = sampleIssues.slice(0, 5);
    for (const item of recentSample) {
      memoryStore.recordActivity({
        action: ACTIVITY_ACTIONS.ISSUE_CREATED,
        description: `Created issue ${item.key}: "${item.title}" [${item.priority}]`,
        issueKey: item.key,
        metadata: { status: item.status, priority: item.priority },
        isDemo: true,
        userId: null,
      });
    }

    if (!quiet) logger.info(`Seeded ${sampleIssues.length} issues in DevTrack in-memory demo store!`);
    return { success: true, count: sampleIssues.length, mode: 'in_memory' };
  }
}

// If executed directly from command line
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => {
      logger.info('Seed script finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed script error:', err);
      process.exit(1);
    });
}

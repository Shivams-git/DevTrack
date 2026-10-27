import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB, isDbConnected } from './config/db.js';
import { logger } from './utils/logger.js';
import { runSeed } from './scripts/seed.js';

async function startServer() {
  logger.info('Starting DevTrack Backend Server...');

  // Attempt database connection
  const dbOk = await connectDB();

  if (dbOk && isDbConnected()) {
    try {
      const { Issue } = await import('./models/Issue.js');
      const { Activity } = await import('./models/Activity.js');
      const { ensureDemoIssuesExist } = await import('./services/issueService.js');

      // Mark any legacy unassigned issues as demo issues
      await Issue.updateMany(
        { $or: [{ userId: null }, { userId: { $exists: false } }] },
        { $set: { isDemo: true } }
      );
      await Activity.updateMany(
        { $or: [{ userId: null }, { userId: { $exists: false } }] },
        { $set: { isDemo: true } }
      );

      // Ensure sample issues exist for Test Mode
      await ensureDemoIssuesExist();
    } catch (migErr) {
      logger.warn('Initial dataset check notice:', migErr.message);
    }
  } else {
    // If running in local fallback mode (no MongoDB instance connected), populate demo store
    logger.warn('Initializing in-memory demo dataset so APIs are fully demonstrable...');
    await runSeed({ quiet: true });
  }

  const server = app.listen(ENV.PORT, () => {
    logger.info(`DevTrack Server is live on port ${ENV.PORT}`);
    logger.info(`Local URL: http://localhost:${ENV.PORT}`);
    logger.info(`Health check: http://localhost:${ENV.PORT}/api/health`);
    logger.info(`Database Mode: ${isDbConnected() ? 'MongoDB Atlas / Local' : 'In-Memory Fallback Demo Store'}`);
  });

  // Graceful shutdown
  const handleShutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('DevTrack HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

startServer().catch((err) => {
  logger.error('Fatal server startup error:', err);
  process.exit(1);
});

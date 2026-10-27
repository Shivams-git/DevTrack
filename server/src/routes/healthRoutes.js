import { Router } from 'express';
import { isDbConnected } from '../config/db.js';
import { ENV } from '../config/env.js';

const router = Router();

router.get('/', (req, res) => {
  const dbConnected = isDbConnected();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: ENV.NODE_ENV,
    database: {
      status: dbConnected ? 'connected' : 'fallback_memory_mode',
      type: dbConnected ? 'MongoDB Atlas / Local' : 'In-Memory Fallback Demo Store',
      persistent: dbConnected,
    },
  });
});

export default router;

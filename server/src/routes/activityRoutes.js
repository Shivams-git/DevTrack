import { Router } from 'express';
import { getActivityFeed } from '../controllers/activityController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', optionalAuth, getActivityFeed);

export default router;

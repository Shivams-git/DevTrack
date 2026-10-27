import { Router } from 'express';
import { getInsights } from '../controllers/insightsController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', optionalAuth, getInsights);

export default router;

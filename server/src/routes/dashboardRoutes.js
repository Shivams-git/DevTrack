import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', optionalAuth, getDashboard);

export default router;

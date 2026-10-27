import { Router } from 'express';
import { getActivityFeed } from '../controllers/activityController.js';

const router = Router();
router.get('/', getActivityFeed);

export default router;

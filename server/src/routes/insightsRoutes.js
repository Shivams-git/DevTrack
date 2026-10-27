import { Router } from 'express';
import { getInsights } from '../controllers/insightsController.js';

const router = Router();
router.get('/', getInsights);

export default router;

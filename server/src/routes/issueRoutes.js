import { Router } from 'express';
import * as issueController from '../controllers/issueController.js';
import { validateCreateIssue, validateUpdateIssue } from '../middleware/validate.js';

const router = Router();

router.get('/', issueController.getIssues);
router.post('/', validateCreateIssue, issueController.createIssue);
router.get('/:id', issueController.getIssueById);
router.patch('/:id', validateUpdateIssue, issueController.updateIssue);
router.delete('/:id', issueController.deleteIssue);

export default router;

import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { dashboard, analytics } from '../controllers/dashboard.controller';

const router = Router();
router.use(authenticate);
router.get('/dashboard', dashboard);
router.get('/analytics', analytics);

export default router;

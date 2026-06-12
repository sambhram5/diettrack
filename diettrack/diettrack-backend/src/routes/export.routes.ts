import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { exportData, weeklyReport } from '../controllers/export.controller';
import { searchHistory, recentActivity } from '../controllers/search.controller';

const router = Router();
router.use(authenticate);

// Export
router.get('/export/:type', exportData);              // GET /api/export/meals?from=&to=
router.get('/export-weekly', weeklyReport);           // GET /api/export-weekly

// Search & activity
router.get('/search', searchHistory);                 // GET /api/search?q=chicken
router.get('/activity', recentActivity);              // GET /api/activity?limit=10

export default router;

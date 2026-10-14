import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as profileController from '../controllers/profile.controller';

const router = Router();
router.use(authenticate);
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

export default router;

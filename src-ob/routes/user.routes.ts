import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, userController.updateMe);
router.post('/id', requireAuth, requireAdmin, userController.getUserByAdmin);
router.post('/logout', requireAuth, userController.logout);

export default router;
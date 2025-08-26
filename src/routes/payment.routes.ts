import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { createCheckoutSession, stripeWebhook } from '../controllers/payment.controller';

const router = Router();

router.post('/create-session', requireAuth, createCheckoutSession);
router.post('/stripe', stripeWebhook);

export default router;

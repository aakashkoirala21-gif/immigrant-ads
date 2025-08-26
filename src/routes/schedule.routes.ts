import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as scheduleController from '../controllers/schedule.controller';

const router = Router();

router.post('/book', requireAuth, scheduleController.bookSchedule);
router.get('/me', requireAuth, scheduleController.getUserSchedules);
router.get('/pro', requireAuth, scheduleController.getProfessionalSchedules);
router.patch('/:id/cancel', requireAuth, scheduleController.cancelSchedule);
router.get('/:professionalId/slots', scheduleController.getAvailableSlots);
router.post('/book/:userId', scheduleController.bookAppointmentController)

export default router;

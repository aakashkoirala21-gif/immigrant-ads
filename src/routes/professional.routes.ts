import { Router } from 'express';

import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { updateProfessionalSchema } from '../validators/professional.validator';
import * as professionalController from '../controllers/professional.controller';

const router = Router();

router.post('/', professionalController.listProfessionals);
router.get('/me', requireAuth, professionalController.getMyProfessionalProfile);
router.post('/update/me', requireAuth, validate(updateProfessionalSchema), professionalController.updateMyProfessionalProfile);
router.post('/id', requireAuth, professionalController.getProfessionalById);
router.post('/id/approve', requireAuth, requireAdmin, professionalController.approveProfessional);


// API 1: Create/Update a professional's availability slots
router.post(
  '/:professionalId/slots',
  // validate(createSlotSchema), // Using Joi validation middleware
  professionalController.createSlotController
);

// API 2: Get available slots for a professional
router.get(
  '/:professionalId/slots',
  // validate(getSlotsSchema), // Using Joi validation middleware
  professionalController.getSlotsController
);

// API 3: Get all appointments for a user (patient or professional)
router.get(
  '/users/:userId/appointments',
  professionalController.getAppointmentsController
);

router.get('/:professionalId/appointments', professionalController.getProfessionalAppointmentsController)

export default router;
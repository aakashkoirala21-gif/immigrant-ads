import { Router } from 'express';
import {  login, registerUser } from '../controllers/auth.controller';
import { forgotPassword, resetUserPassword } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import * as authSchema from '../validators/auth.validator';
const router = Router();

router.post('/forgot-password', validate(authSchema.forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(authSchema.resetPasswordSchema), resetUserPassword);
router.post('/register', validate(authSchema.registerSchema), registerUser);
router.post('/login', validate(authSchema.loginSchema), login);

export default router;

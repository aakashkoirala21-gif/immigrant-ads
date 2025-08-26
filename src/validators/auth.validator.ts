import Joi from 'joi';

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const registerSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Phone number must be valid and contain 10–15 digits.',
      'string.empty': 'Phone number is required.',
    }),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'professional', 'admin').optional(),
  license_number: Joi.when('role', {
    is: 'professional',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  category_id: Joi.when('role', {
    is: 'professional',
    then: Joi.string().uuid().required(),
    otherwise: Joi.forbidden(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be valid',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
});

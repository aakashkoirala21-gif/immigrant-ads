import Joi from 'joi';

export const updateProfessionalSchema = Joi.object({
  bio: Joi.string().max(500).optional(),
  availability: Joi.array().optional(), 
  price_per_slot: Joi.number().optional(),
  location: Joi.string().optional(),
  category_id: Joi.string().uuid().optional(),
});
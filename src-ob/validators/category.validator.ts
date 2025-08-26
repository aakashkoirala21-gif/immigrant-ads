import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().optional(),
});

import Joi from 'joi';

export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(10).required(),
  category_id: Joi.string().uuid().optional(),
});

export const updatePostSchema = Joi.object({
  id: Joi.string().uuid().required(),
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(10).required(),
  category_id: Joi.string().uuid().optional(),
});


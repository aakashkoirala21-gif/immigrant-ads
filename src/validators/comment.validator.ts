import Joi from 'joi';

export const createCommentSchema = Joi.object({
  post_id: Joi.string().uuid().required(),
  content: Joi.string().min(1).required(),
});

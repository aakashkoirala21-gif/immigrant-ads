import Joi from 'joi';

export const likePostSchema = Joi.object({
  post_id: Joi.string().uuid().required(),
});

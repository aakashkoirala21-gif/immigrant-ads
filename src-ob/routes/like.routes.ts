import { Router } from 'express';
import { likePost, unlikePost } from '../controllers/like.controller'
import { requireAuth } from '../middlewares/auth.middleware';
import { likePostSchema } from '../validators/like.validator';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/', requireAuth, validate(likePostSchema), likePost);
router.delete('/', requireAuth, validate(likePostSchema), unlikePost);


export default router;

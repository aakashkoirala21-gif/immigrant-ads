import { Router } from 'express';
import * as communityController from '../controllers/community.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { createPostSchema, updatePostSchema } from '../validators/community.validator';
import { validate } from '../middlewares/validate';
const router = Router();

router.get('/',  requireAuth, communityController.getPosts);
router.post('/id', communityController.getPostById);
router.post('/category-id', communityController.getPostsByCategory);
router.post('/', requireAuth, validate(createPostSchema), communityController.createPost);
router.post('/alter-post', requireAuth, validate(updatePostSchema), communityController.updatePost);
router.post('/id', requireAuth, communityController.deletePost);

export default router;

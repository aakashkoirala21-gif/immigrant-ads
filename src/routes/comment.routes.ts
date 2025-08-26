import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createCommentSchema } from '../validators/comment.validator';

const router = Router();

router.post('/', requireAuth, validate(createCommentSchema), commentController.addComment);
router.post('/delete', requireAuth, commentController.deleteComment);
router.post('/comments-by-post', requireAuth, commentController.getComments);
router.post('/update', requireAuth, commentController.updateComment);


export default router;

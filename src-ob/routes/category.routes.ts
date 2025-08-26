import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../controllers/category.controller';
import { createCategorySchema } from '../validators/category.validator';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/', getCategories);
router.post('/', requireAuth, requireAdmin, validate(createCategorySchema), createCategory);
router.post('/update', requireAuth, requireAdmin, updateCategory)
router.post('/delete', requireAuth, requireAdmin, deleteCategory )

export default router;

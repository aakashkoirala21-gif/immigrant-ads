import { Category, CommunityPost, User } from '../models';

export async function getAllCategories() {
  return Category.findAll({ order: [['created_at', 'DESC']] });
}

export async function addCategory(data: { name: string; description?: string }) {
  return Category.create(data);
}

export async function fetchPostsPaginated(limit: number, offset: number) {
  return CommunityPost.findAndCountAll({
    include: [{ model: User, attributes: ['full_name'] }, Category],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
}

// Update category by ID
export async function updateCategoryById(id: string, data: { name: string }) {
  const category = await Category.findByPk(id);
  console.log('category______', category)
  if (!category) return null;

  await category.update(data);
  return category;
}

// Delete category by ID
export async function deleteCategoryById(id: string) {
  const category = await Category.findByPk(id);
  if (!category) return null;

  await category.destroy();
  return true;
}
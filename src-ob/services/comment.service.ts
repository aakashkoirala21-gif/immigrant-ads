import { Comment, User } from '../models';

export async function createComment(user_id: string, data: { post_id: string; content: string }) {
  return Comment.create({ user_id, ...data });
}
export async function removeComment(user_id: string, comment_id: string) {
  const comment = await Comment.findByPk(comment_id);
  if (!comment || comment.user_id !== user_id) throw new Error('Unauthorized or comment not found');
  await comment.destroy();
  return { deleted: true };
}

// Get all comments for a given post
export async function getCommentsByPostId(post_id: string) {
  return Comment.findAll({
    where: { post_id },
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        attributes: [
          'id',
          'full_name',
          'email',
          'phone',
          'profile_picture_url',
          'role',
          'location',
          'created_at',
          'updated_at',
        ], // only return safe user fields
       },
    ],
  });
}

// Update comment content if user is owner
export async function updateCommentById(id: string, user_id: string, content: string) {
  const comment = await Comment.findOne({ where: { id, user_id } });
  if (!comment) return null;

  await comment.update({ content });
  return comment;
}
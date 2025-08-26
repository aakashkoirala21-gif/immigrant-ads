import { Sequelize } from 'sequelize';
import { CommunityPost, User, Category, Like, Comment } from '../models';

export async function createCommunityPost(user_id: string, data: { title: string; content: string; category_id?: string }) {
  return CommunityPost.create({ user_id, ...data });
}

export async function fetchPosts(currentUserId: string) {
  return CommunityPost.findAll({
    attributes: {
      include: [
        [Sequelize.fn('COUNT', Sequelize.col('likes.id')), 'like_count'],
        [Sequelize.fn('COUNT', Sequelize.col('comments.id')), 'comment_count'],

        // ✨ --- START: NEW ATTRIBUTES --- ✨
        [
          // Subquery to check if a 'like' from the current user exists for this post
          Sequelize.literal(`(
            EXISTS(
              SELECT 1 FROM "likes" AS "like"
              WHERE
                "like"."user_id" = '${currentUserId}' AND
                "like"."post_id" = "CommunityPost"."id"
            )
          )`),
          'has_liked' // Name the new boolean attribute 'has_liked'
        ],
        [
          // Subquery to check if a 'comment' from the current user exists for this post
          Sequelize.literal(`(
            EXISTS(
              SELECT 1 FROM "comments" AS "comment"
              WHERE
                "comment"."user_id" = '${currentUserId}' AND
                "comment"."post_id" = "CommunityPost"."id"
            )
          )`),
          'has_commented' // Name the new boolean attribute 'has_commented'
        ]
        // ✨ --- END: NEW ATTRIBUTES --- ✨
      ]
    },
    include: [
      { 
        model: User, 
        as: 'user', 
        attributes: ['full_name'] 
      },
      { 
        model: Category 
      },
      // Includes for counting (LEFT JOIN)
      {
        model: Like,
        as: 'likes',
        attributes: []
      },
      {
        model: Comment,
        as: 'comments',
        attributes: []
      }
    ],
    order: [['created_at', 'DESC']],
    // The group by needs to include all non-aggregated columns from the main table
    group: ['CommunityPost.id', 'user.id', 'Category.id']
  });
}

export async function fetchPostById(id: string) {
  return CommunityPost.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['full_name'] }, Category],
  });
}

export async function fetchPostsByCategory(category_id: string) {
  return CommunityPost.findAll({ where: { category_id } });
}

export async function updateCommunityPost(user_id: string, post_id: string, data: { title: string; content: string; category_id?: string }) {
  const post = await CommunityPost.findByPk(post_id);
  if (!post || post.user_id !== user_id) throw new Error('Unauthorized or post not found');
  return post.update(data);
}

export async function deleteCommunityPost(user_id: string, post_id: string) {
  const post = await CommunityPost.findByPk(post_id);
  if (!post || post.user_id !== user_id) throw new Error('Unauthorized or post not found');
  await post.destroy();
  return { deleted: true };
}

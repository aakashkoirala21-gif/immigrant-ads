import { Like } from '../models';

export async function likeCommunityPost(user_id: string, post_id: string) {
  const existing = await Like.findOne({ where: { user_id, post_id } });
  if (existing) throw new Error('Already liked');

  return Like.create({ user_id, post_id });
}


export async function unlikeCommunityPost(user_id: string, post_id: string) {
    const existing = await Like.findOne({ where: { user_id, post_id } });
    if (!existing) {
      throw new Error('Like not found');
    }

    await existing.destroy();
    return { post_id, user_id };
}
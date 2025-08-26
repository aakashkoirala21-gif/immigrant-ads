import { User } from '../models';

export async function getUserById(id: string) {
  const user = await User.findByPk(id, {
    attributes: ['id', 'full_name', 'email', 'role', 'location', 'created_at'],
  });
  if (!user) throw new Error('User not found');
  return user;
}

export async function updateUser(id: string, data: Partial<{ full_name: string; location: string }>) {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  await user.update(data);
  return user;
}

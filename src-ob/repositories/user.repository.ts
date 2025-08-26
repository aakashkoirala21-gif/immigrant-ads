import { Op } from 'sequelize';
import { User } from '../models';

export async function findUserByEmail(email: string) {
  return User.findOne({ where: { email } });
}

export async function findUserByResetToken(token: string) {
  return User.findOne({
    where: {
      reset_token: token,
      reset_token_expiry: {
        [Op.gt]: new Date(),
      },
    },
  });
}

export async function createUser(data: {
  full_name: string;
  email: string;
  phone: number;
  password_hash: string;
  role: 'user' | 'professional' | 'admin';
}) {
  return User.create(data);
}

export async function updateResetToken(user: any, token: string, expiry: Date) {
  return user.update({
    reset_token: token,
    reset_token_expiry: expiry,
  });
}

export async function resetUserPassword(user: any, newHash: string) {
  return user.update({
    password_hash: newHash,
    reset_token: null,
    reset_token_expiry: null,
  });
}

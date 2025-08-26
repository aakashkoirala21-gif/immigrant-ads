import { Op } from 'sequelize';
import { User } from '../models'; // assuming index.ts exports defineUserModel as User

// 🔍 Find user by email
export async function findUserByEmail(email: string) {
  return User.findOne({ where: { email } });
}

// 🔍 Find user by reset token
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

// 🆕 Create new user
export async function createUser(data: {
  full_name: string;
  email: string;
  phone?: string | null; // ✅ allow string or null
  profile_picture_url?: string | null; // ✅ optional
  password_hash: string;
  role: 'user' | 'professional' | 'admin';
}) {
  return User.create({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone ?? null, // ✅ safe fallback
    profile_picture_url: data.profile_picture_url ?? null, // ✅ safe fallback
    password_hash: data.password_hash,
    role: data.role,
  });
}

// 🔑 Update reset token
export async function updateResetToken(user: any, token: string, expiry: Date) {
  return user.update({
    reset_token: token,
    reset_token_expiry: expiry,
  });
}

// 🔑 Reset password
export async function resetUserPassword(user: any, newHash: string) {
  return user.update({
    password_hash: newHash,
    reset_token: null,
    reset_token_expiry: null,
  });
}

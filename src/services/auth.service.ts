import crypto from 'crypto';
import { generateToken } from '../utils/jwt';
import {
  findUserByEmail,
  findUserByResetToken,
  createUser,
  updateResetToken,
  resetUserPassword,
} from '../repositories/user.repository';
import { hashPassword, comparePasswords } from '../utils/password';
import { sendEmail } from '../utils/email';

export async function registerUser(data: {
  full_name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string | null;               // ✅ allow optional phone
  profile_picture_url?: string | null; // ✅ allow optional profile picture
}) {
  const { full_name, email, password, role, phone, profile_picture_url } = data;

  const existing = await findUserByEmail(email);
  if (existing) throw new Error('Email already in use');

  const password_hash = await hashPassword(password);

  const user = await createUser({
    full_name,
    email,
    password_hash,
    role: (role || 'user') as 'user' | 'professional' | 'admin',
    phone: phone || null,                           // ✅ ensure null if not provided
    profile_picture_url: profile_picture_url || null, // ✅ ensure null if not provided
  });

  const token = generateToken({ id: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await comparePasswords(password, user.password_hash);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken({ id: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function sendResetLink(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No user found with that email');

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await updateResetToken(user, token, expiry);

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  const htmlContent = `
    <h2>Reset Your Password</h2>
    <p>Click below to reset your password:</p>
    <a href="${resetLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail(email, 'Password Reset Request', htmlContent);

  return { message: 'Reset link sent to email' };
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await findUserByResetToken(token);
  if (!user) throw new Error('Invalid or expired token');

  const password_hash = await hashPassword(newPassword);
  await resetUserPassword(user, password_hash);

  return { message: 'Password updated successfully' };
}

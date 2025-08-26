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
import { sendEmail } from '../utils/email'
import { Professional } from '../models';

export async function registerUser(data: {
  full_name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const { full_name, email, password, role } = data;

  const existing = await findUserByEmail(email);
  if (existing) throw new Error('Email already in use');

  const password_hash = await hashPassword(password);

  const user = await createUser({
    full_name,
    email,
    password_hash,
    role: (role || 'user') as 'user' | 'professional' | 'admin',
  });

  const token = generateToken({ id: user.id, role: user.role });

  return {
    user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    token,
  };
}


export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await comparePasswords(password, user.password_hash);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken({ id: user.id, role: user.role });

  // If user is a professional, fetch their extra data
  let professionalData = null;
  if (user.role === 'professional') {
    const professional = await Professional.findOne({
      where: { id: user.id },
      attributes: ['id', 'license_number', 'category_id', 'is_paid', 'approved', 'bio'],
    });

    if (professional) {
      professionalData = professional.toJSON();
    }
  }

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      ...(professionalData ? { professional: professionalData } : {}),
    },
    token,
  };
}

export async function sendResetLink(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No user found with that email');

  const token = crypto.randomBytes(32).toString('hex');
  console.log('token____________',token)
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await updateResetToken(user, token, expiry);

  // Generate the reset link
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

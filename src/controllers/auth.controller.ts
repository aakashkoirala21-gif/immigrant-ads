import { Request, Response } from 'express';
import { loginUser } from '../services/auth.service';
import { sendResetLink, resetPassword } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { Professional } from '../models';
import { generateToken } from '../utils/jwt';
import { createUser, findUserByEmail } from '../repositories/user.repository';
import { hashPassword } from '../utils/password';

export async function forgotPassword(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { email } = req.body;
    await sendResetLink(email);

    return sendResponse({
      res,
      message:
        'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err: any) {
    console.error('[ForgotPassword]', err);
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: 'Failed to process forgot password request.',
      error: err.message,
    });
  }
}

export async function resetUserPassword(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPassword(token, newPassword);

    return sendResponse({
      res,
      message: result.message,
    });
  } catch (err: any) {
    console.error('[ResetPassword]', err);
    return sendResponse({
      res,
      statusCode: 400,
      success: false,
      message: 'Reset password failed.',
      error: err.message,
    });
  }
}

export async function registerUser(req: Request, res: Response): Promise<any> {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      role = 'user',
      license_number,
      category_id,
    } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: 'Email already in use.',
      });
    }

    const password_hash = await hashPassword(password);

    const user = await createUser({ full_name, email, phone, password_hash, role });

    // If registering as professional, create the professional profile
    if (role === 'professional') {
      if (!license_number || !category_id) {
        return sendResponse({
          res,
          success: false,
          statusCode: 400,
          message:
            'Professional registration requires license_number and category_id',
        });
      }

      await Professional.create({
        id: user.id,
        license_number,
        category_id,
        is_paid: false,
        approved: false,
      });
    }

    const token = generateToken({ id: user.id, role: user.role });
    return sendResponse({
      res, 
      statusCode: 201,
      message: 'Account created successfully.',
      data: {
        user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      token,
      }
    })
  } catch (err: any) {
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Internal server error.',
      error: err
    })
  }
}

export async function login(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    return sendResponse({
      res,
      message: 'Login successful.',
      data: result,
    });
  } catch (err: any) {
    console.error('[Login]', err);
    return sendResponse({
      res,
      statusCode: 401,
      success: false,
      message: 'Invalid email or password.',
      error: err.message,
    });
  }
}

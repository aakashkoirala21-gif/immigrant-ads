import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import { getUserById, updateUser } from '../services/user.service';

export async function getMe(req: Request, res: Response): Promise<any> {
  try {
    if (!req.user || !req.user.id) {
      return sendResponse({ res, statusCode: 401, success: false, message: 'Unauthorized' });
    }

    const user = await getUserById(req.user.id);

    if (!user) {
      return sendResponse({ res, statusCode: 404, success: false, message: 'User not found' });
    }

    return sendResponse({ res, message: 'User fetched', data: user });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to fetch user',
    });
  }
}

export async function updateMe(req: Request, res: Response): Promise<any> {
  try {
    if (!req.user || !req.user.id) {
      return sendResponse({ res, statusCode: 401, success: false, message: 'Unauthorized' });
    }

    const updated = await updateUser(req.user.id, req.body);

    if (!updated) {
      return sendResponse({ res, statusCode: 404, success: false, message: 'User not found or update failed' });
    }

    return sendResponse({ res, message: 'User updated', data: updated });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
}

export async function getUserByAdmin(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.body;

    if (!id) {
      return sendResponse({ res, statusCode: 400, success: false, message: 'User ID is required' });
    }

    const user = await getUserById(id);

    if (!user) {
      return sendResponse({ res, statusCode: 404, success: false, message: 'User not found' });
    }

    return sendResponse({ res, message: 'User found', data: user });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to fetch user',
    });
  }
}

export async function logout(req: Request, res: Response): Promise<any> {
  try {
    // If applicable, you can clear cookies or invalidate tokens here
    return sendResponse({ res, message: 'Logged out successfully' });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Logout failed',
    });
  }
}

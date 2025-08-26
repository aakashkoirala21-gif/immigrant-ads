import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import { likeCommunityPost, unlikeCommunityPost } from '../services/like.service';

export async function likePost(req: Request, res: Response): Promise<any> {
  try {
    const result = await likeCommunityPost(req.user!.id, req.body.post_id);
    return sendResponse({ res, message: 'Post liked', data: result });
  } catch (err: any) {
    const status = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    return res.status(status).json({ success: false, message });
  }
}

export async function unlikePost(req: Request, res: Response): Promise<any> {
  try {
    const result = await unlikeCommunityPost(req.user!.id, req.body.post_id);
    return sendResponse({ res, message: 'Post unliked', data: result });
  } catch (err: any) {
    const status = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    return res.status(status).json({ success: false, message });
  }
}
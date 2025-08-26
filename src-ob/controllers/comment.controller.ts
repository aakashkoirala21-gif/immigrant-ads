import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import { createComment, getCommentsByPostId, removeComment, updateCommentById } from '../services/comment.service';

// Add a new comment
export async function addComment(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.user!.id;
    const { post_id, content } = req.body;

    if (!post_id || !content) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'Post ID and content are required.',
      });
    }

    const comment = await createComment(userId, { post_id, content });

    return sendResponse({
      res,
      message: 'Comment added successfully.',
      data: comment,
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Failed to add comment.',
      error,
    });
  }
}

// Delete a comment
export async function deleteComment(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.user!.id;
    const { comment_id } = req.body;

    if (!comment_id) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'Comment ID is required.',
      });
    }

    const result = await removeComment(userId, comment_id);

    if (!result) {
      return sendResponse({
        res,
        statusCode: 404,
        message: 'Comment not found or unauthorized.',
      });
    }

    return sendResponse({
      res,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Failed to delete comment.',
      error,
    });
  }
}


// Get comments for a specific post
export async function getComments(req: Request, res: Response): Promise<any> {
  try {
    const { post_id } = req.body;
    const comments = await getCommentsByPostId(post_id);

    return sendResponse({
      res,
      message: 'Comments retrieved successfully.',
      data: comments,
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Internal server error.',
      error,
    });
  }
}

// Update a comment
export async function updateComment(req: Request, res: Response): Promise<any> {
  try {
    const user_id = req.user!.id;
    const {id, content } = req.body;

    if (!content) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'Comment content is required.',
      });
    }

    const updated = await updateCommentById(id, user_id, content);

    if (!updated) {
      return sendResponse({
        res,
        statusCode: 404,
        message: 'Comment not found or unauthorized.',
      });
    }

    return sendResponse({
      res,
      message: 'Comment updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.log(error, '______________error')
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Internal server error.',
      error,
    });
  }
}

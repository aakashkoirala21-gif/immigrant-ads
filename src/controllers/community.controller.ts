import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as communityService from '../services/community.service';

// Create a new community post
export async function createPost(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.user!.id;
    const { title, content } = req.body;

    if (!title || !content) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'Title and content are required.',
      });
    }

    const post = await communityService.createCommunityPost(userId, req.body);

    return sendResponse({
      res,
      message: 'Post created successfully.',
      data: post,
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Failed to create post.',
      error,
    });
  }
}

// Get all community posts
export async function getPosts(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.user!.id; 
    const posts = await communityService.fetchPosts(userId);

    return sendResponse({
      res,
      message: 'All posts retrieved successfully.',
      data: posts,
    });
  } catch (error) {
    console.log('Error:',error)
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Failed to fetch posts.',
      error,
    });
  }
}

// Get a single post by ID
export async function getPostById(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.body;

    if (!id) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'Post ID is required.',
      });
    }

    const post = await communityService.fetchPostById(id);

    if (!post) {
      return sendResponse({
        res,
        statusCode: 404,
        message: 'Post not found.',
      });
    }

    return sendResponse({
      res,
      message: 'Post retrieved successfully.',
      data: post,
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Failed to fetch post.',
      error,
    });
  }
}


export async function getPostsByCategory(
  req: Request,
  res: Response
): Promise<any> {
  const posts = await communityService.fetchPostsByCategory(
    req.body.category_id
  );
  return sendResponse({
    res,
    message: 'Post fetched by category.',
    data: posts,
  });
}

// Update a community post
export async function updatePost(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.user!.id;
    const { post_id, title, content } = req.body;

    if (!post_id) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'Post ID is required.',
      });
    }

    if (!title && !content) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'At least one of title or content must be provided.',
      });
    }

    const updated = await communityService.updateCommunityPost(userId, post_id, req.body);

    if (!updated) {
      return sendResponse({
        res,
        statusCode: 404,
        message: 'Post not found or unauthorized to update.',
      });
    }

    return sendResponse({
      res,
      message: 'Post updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.log('error__________', error )
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Failed to update post.',
      error,
    });
  }
}

// Delete a community post
export async function deletePost(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.user!.id;
    const { id } = req.body;

    if (!id) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'Post ID is required.',
      });
    }

    const result = await communityService.deleteCommunityPost(userId, id);

    if (!result) {
      return sendResponse({
        res,
        statusCode: 404,
        message: 'Post not found or unauthorized to delete.',
      });
    }

    return sendResponse({
      res,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      message: 'Failed to delete post.',
      error,
    });
  }
}
import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as categoryService from '../services/category.service';
import { Category } from '../models';

export async function getCategories(req: Request, res: Response): Promise<any> {
  try {    
    const categories = await categoryService.getAllCategories();
    if(!categories){
      return sendResponse({
      res,
      message: 'No category found.',
      data: categories,
    });
    }
    return sendResponse({
      res,
      message: 'Categories retrieved successfully.',
      data: categories,
    });
  } catch (error) {
    return sendResponse({
      res, 
      statusCode: 500,
      message: 'Internal server error.',
      error: error
    })
  }
}

export async function createCategory(
  req: Request,
  res: Response
): Promise<any> {
  const { name } = req.body;

  try {
    // Check if both name and description are provided
    if (!name) {
      throw new Error('Category name is required.');
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: {
        name,
      },
    });

    if (existingCategory) {
      throw new Error('A category with the same name already exists.');
    }

    // Create category
    const category = await categoryService.addCategory(req.body);
    return sendResponse({ res, message: 'Category created', data: category });
  } catch (err: any) {
    return sendResponse({
      res,
      statusCode: 400,
      success: false,
      message: 'Failed to add category.',
      error: err.message,
    });
  }
}


// Update Category
export async function updateCategory(req: Request, res: Response): Promise<any> {
  try {
    const { id, name } = req.body;

    if (!name) {
      return sendResponse({
        res,
        statusCode: 400,
        message: 'Category name is required.',
      });
    }

    const updated = await categoryService.updateCategoryById(id, { name });

    if (!updated) {
      return sendResponse({
        res,
        statusCode: 404,
        message: 'Category not found.',
      });
    }

    return sendResponse({
      res,
      message: 'Category updated successfully.',
      data: updated,
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

// Delete Category
export async function deleteCategory(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.body;

    const deleted = await categoryService.deleteCategoryById(id);

    if (!deleted) {
      return sendResponse({
        res,
        statusCode: 404,
        message: 'Category not found.',
      });
    }

    return sendResponse({
      res,
      message: 'Category deleted successfully.',
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
import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as professionalService from '../services/professional.service';
import { createOrUpdateSlot, getAppointmentsForUser, getAvailableSlots } from '../services/professional.service';

export async function getMyProfessionalProfile(req: Request, res: Response): Promise<any> {
  try {
    // Defensive check for auth
    if (!req.user || !req.user.id) {
        return sendResponse({
          res,
          statusCode: 401,
          success: false,
          message: 'Unauthorized access. User not found in request.',
        });
    }

    const professional = await professionalService.getMyProfile(req.user.id);

    // Handle case where profile is not found
    if (!professional) {
      return sendResponse({
        res,
        statusCode: 404,
        success: false,
        message: 'Professional profile not found',
      });
    }

    // Successful response
    return sendResponse({
      res,
      message: 'Professional profile fetched',
      data: professional,
    });

  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'An unexpected error occurred while fetching profile',
    });
  }
}

export async function updateMyProfessionalProfile(req: Request, res: Response): Promise<any> {
  try {
    if (!req.user || !req.user.id) {
      return sendResponse({ res, statusCode: 401, success: false, message: 'Unauthorized' });
    }

    const updated = await professionalService.updateMyProfile(req.user.id, req.body);

    if (!updated) {
      return sendResponse({ res, statusCode: 404, success: false, message: 'Professional profile not found' });
    }

    return sendResponse({ res, message: 'Professional profile updated', data: updated });
  } catch (error: any) {
    console.log('This is the error:',error)
    return sendResponse({ res, statusCode: 500, success: false, message: error.message || 'Failed to update profile' });
  }
}
export async function getProfessionalById(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.body;

    if (!id) {
      return sendResponse({ res, statusCode: 400, success: false, message: 'Professional ID is required' });
    }

    const professional = await professionalService.getById(id);

    if (!professional) {
      return sendResponse({ res, statusCode: 404, success: false, message: 'Professional not found' });
    }

    return sendResponse({ res, message: 'Professional found', data: professional });
  } catch (error: any) {
    return sendResponse({ res, statusCode: 500, success: false, message: error.message || 'Failed to fetch professional' });
  }
}


export async function approveProfessional(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.body;

    if (!id) {
      return sendResponse({ res, statusCode: 400, success: false, message: 'Professional ID is required' });
    }

    const updated = await professionalService.approveProfessionalById(id);

    if (!updated) {
      return sendResponse({ res, statusCode: 404, success: false, message: 'Professional not found or already approved' });
    }

    return sendResponse({ res, message: 'Professional approved', data: updated });
  } catch (error: any) {
    return sendResponse({ res, statusCode: 500, success: false, message: error.message || 'Failed to approve professional' });
  }
}

export async function listProfessionals(req: Request, res: Response): Promise<any> {
  try {
    const { category_id, location } = req.body;

    const professionals = await professionalService.listAllProfessionals(
      category_id as string,
      location as string
    );

    // Sanitize sensitive info before sending
    const safeProfessionals = professionals.map((p: any) => {
      const json = p.toJSON ? p.toJSON() : p;

      return {
        ...json,
        User: json.User
          ? {
              ...json.User,
              password_hash: undefined,
              reset_token: undefined,
              reset_token_expiry: undefined,
            }
          : null,
      };
    });

    return sendResponse({
      res,
      message: 'Professionals listed',
      data: safeProfessionals,
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to list professionals',
    });
  }
}


// ********************************************************************************* //

export async function createSlotController(req: Request, res: Response): Promise<any> {
  try {
    // The route parameter is named 'professionalId', but it refers to the user's 'id'
    const { professionalId: id } = req.params;
    const availabilityData = req.body;

    const professional = await createOrUpdateSlot(id, availabilityData);
    
    return sendResponse({
      res,
      message: 'Availability updated successfully.',
      data: {
        professionalId: professional.id,
        availability: professional.availability,
      },
    });

  } catch (error: any) {
    // Handle specific "not found" error from the service
    if (error.message === 'Professional not found.') {
        return sendResponse({
            res,
            statusCode: 404,
            success: false,
            message: error.message,
        });
    }
    // Handle all other errors
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'An unexpected error occurred while creating the slot.',
    });
  }
}

export async function getSlotsController(req: Request, res: Response): Promise<any> {
  try {
    const { professionalId: id } = req.params;
    const { start_date, end_date } = req.query;

    const availableSlots = await getAvailableSlots(
      id,
      new Date(start_date as string),
      new Date(end_date as string)
    );

    return sendResponse({
      res,
      message: 'Available slots fetched successfully.',
      data: { slots: availableSlots },
    });

  } catch (error: any) {
    if (error.message.includes('Availability for this professional')) {
        return sendResponse({
            res,
            statusCode: 404,
            success: false,
            message: error.message,
        });
    }
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'An unexpected error occurred while fetching slots.',
    });
  }
}

export async function getAppointmentsController(req: Request, res: Response): Promise<any> {
  try {
    // In a real app, userId would come from the authenticated user token (e.g., req.user.id)
    const { userId } = req.params;

    const appointments = await getAppointmentsForUser(userId);

    // The service returns an empty array if no appointments are found, which is a valid success case.
    return sendResponse({
      res,
      message: 'Appointments fetched successfully.',
      data: { appointments },
    });

  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'An unexpected error occurred while fetching appointments.',
    });
  }
}

export async function getProfessionalAppointmentsController(req: Request, res: Response): Promise<any> {
  try {
    // 1. Get the professionalId from the URL parameters
    const { professionalId } = req.params;

    // 2. Call the service to fetch the appointments
    const appointments = await professionalService.getAppointmentsForProfessional(professionalId);

    return sendResponse({
      res,
      message: 'Appointments fetched successfully.',
      data: appointments,
    });

  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: 'An unexpected error occurred while fetching appointments.',
    });
  }
}
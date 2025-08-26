import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as scheduleService from '../services/schedule.service';
import { bookAppointmentSimple } from '../services/schedule.service';
import { sendEmail } from '../services/email.service';

export async function bookSchedule(req: Request, res: Response): Promise<any> {
  try {
    if (!req.user || !req.user.id) {
      return sendResponse({
        res,
        statusCode: 401,
        success: false,
        message: 'Unauthorized',
      });
    }

    const data = await scheduleService.createSchedule(req.user.id, req.body);

    return sendResponse({ res, message: 'Schedule booked', data });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to book schedule',
    });
  }
}

export async function getUserSchedules(
  req: Request,
  res: Response
): Promise<any> {
  try {
    if (!req.user || !req.user.id) {
      return sendResponse({
        res,
        statusCode: 401,
        success: false,
        message: 'Unauthorized',
      });
    }

    const schedules = await scheduleService.getSchedulesForUser(req.user.id);

    return sendResponse({ res, message: 'Your schedules', data: schedules });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to fetch schedules',
    });
  }
}

export async function getProfessionalSchedules(
  req: Request,
  res: Response
): Promise<any> {
  try {
    if (!req.user || !req.user.id) {
      return sendResponse({
        res,
        statusCode: 401,
        success: false,
        message: 'Unauthorized',
      });
    }

    const schedules = await scheduleService.getSchedulesForProfessional(
      req.user.id
    );

    return sendResponse({
      res,
      message: 'Your professional bookings',
      data: schedules,
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to fetch professional bookings',
    });
  }
}

export async function cancelSchedule(
  req: Request,
  res: Response
): Promise<any> {
  try {
    if (!req.user || !req.user.id) {
      return sendResponse({
        res,
        statusCode: 401,
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    if (!id) {
      return sendResponse({
        res,
        statusCode: 400,
        success: false,
        message: 'Schedule ID is required',
      });
    }

    const result = await scheduleService.cancelScheduleById(id, req.user.id);

    if (!result) {
      return sendResponse({
        res,
        statusCode: 404,
        success: false,
        message: 'Schedule not found or cannot be cancelled',
      });
    }

    return sendResponse({ res, message: 'Schedule cancelled', data: result });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to cancel schedule',
    });
  }
}

export async function getAvailableSlots(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { professionalId } = req.params;

    if (!professionalId) {
      return sendResponse({
        res,
        statusCode: 400,
        success: false,
        message: 'Professional ID is required',
      });
    }

    const slots = await scheduleService.getAvailableTimeSlots(professionalId);

    return sendResponse({ res, message: 'Available slots', data: slots });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to get available slots',
    });
  }
}

export async function bookAppointmentController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    // 1. Get the userId from the URL parameters
    const { userId } = req.params;

    // 2. Pass the userId and request body to the service
    const appointment = await bookAppointmentSimple(userId, req.body);
    console.log(
      'appointment.patient',
      appointment.patient,
      'appointment',
      appointment
    );
    if (appointment && appointment.patient) {
      // <-- Use 'patient'
      sendEmail({
        to: appointment.patient.email,
        subject: 'Appointment Confirmed',
        text: `Hello ${appointment.patient.full_name},\n\nYour appointment has been successfully booked.\n\nThank you!`,
      });
    }
    return sendResponse({
      res,
      message: 'Appointment booked successfully.',
      data: appointment,
    });
  } catch (error: any) {
    // if (error.message.includes('not available') || error.message.includes('not found')) {
    console.log(error);
    return sendResponse({
      res,
      statusCode: 409, // Conflict
      success: false,
      message: error.message,
    });
    // }

    // return sendResponse({
    //   res,
    //   statusCode: 500,
    //   success: false,
    //   message: 'An unexpected error occurred while booking the appointment.',
    // });
  }
}

import { Op } from 'sequelize';
import { Professional, Schedule, User } from '../models';
import { createGoogleMeetEvent } from '../utils/googleCalendar';
import { BookingPayload } from '../types/user.types';

export async function createSchedule(userId: string, data: {
  professional_id: string;
  start_time: Date;
  end_time: Date;
}) {
  // 1. Conflict check
  const conflict = await Schedule.findOne({
    where: {
      professional_id: data.professional_id,
      start_time: data.start_time,
    },
  });

  if (conflict) throw new Error('Time slot already booked');

  // 2. Generate Google Meet link
  const meetUrl = await createGoogleMeetEvent({
    summary: '1-on-1 Session',
    description: 'Meeting scheduled via ProConnect',
    start: data.start_time.toISOString(),
    end: data.end_time.toISOString(),
  });

  // 3. Create schedule with Meet URL
  return Schedule.create({
    user_id: userId,
    professional_id: data.professional_id,
    start_time: data.start_time,
    end_time: data.end_time,
    status: 'confirmed',
    google_meet_url: meetUrl,
  });
}

export async function getSchedulesForUser(userId: string) {
  return Schedule.findAll({
    where: { user_id: userId },
    order: [['start_time', 'ASC']],
  });
}

export async function getSchedulesForProfessional(proId: string) {
  return Schedule.findAll({
    where: { professional_id: proId },
    order: [['start_time', 'ASC']],
  });
}

export async function cancelScheduleById(id: string, userId: string) {
  const schedule = await Schedule.findByPk(id);
  if (!schedule) throw new Error('Schedule not found');

  // optionally: verify user/professional owns it
  if (schedule.user_id !== userId && schedule.professional_id !== userId) {
    throw new Error('Not authorized to cancel this schedule');
  }

  await schedule.update({ status: 'cancelled' });
  return schedule;
}

export async function getAvailableTimeSlots(proId: string) {
  const today = new Date();
  const schedules = await Schedule.findAll({
    where: {
      professional_id: proId,
      start_time: { $gte: today },
      status: 'confirmed',
    },
    attributes: ['start_time', 'end_time'],
  });

  // Just return blocked times — frontend can show availability
  return schedules;
}

export const bookAppointmentSimple = async (userId: string, payload: any) => {
  const { professionalId, startTime, endTime, symptoms, documents } = payload;

  const professional = await Professional.findByPk(professionalId);
  if (!professional) {
    throw new Error('Professional not found.');
  }

  const existingAppointment = await Schedule.findOne({
    where: {
      professional_id: professionalId,
      start_time: startTime,
      status: { [Op.ne]: 'cancelled' },
    },
  });

  if (existingAppointment) {
    throw new Error('This time slot is no longer available.');
  }

  try {
    const newSchedule = await Schedule.create({
      user_id: userId,
      professional_id: professionalId,
      start_time: new Date(startTime),
      end_time: new Date(endTime),
      status: 'confirmed',
      symptoms,
      documents,
      appointment_type: 0,
    });

    // --- THIS IS THE FIX ---
    // Instead of returning newSchedule, re-fetch it with the included data.
    const fullAppointmentDetails = await Schedule.findByPk(newSchedule.id, {
      include: [
        {
          model: User,
          as: 'patient', // Use the 'patient' alias from your models/index.ts
        },
        // You can also include the professional here if you need its details
        {
          model: Professional,
          as: 'professional',
          include: [{ model: User, attributes: ['full_name'] }] // To get the professional's name
        }
      ],
    });

    if (!fullAppointmentDetails) {
      throw new Error('Could not retrieve appointment details after creation.');
    }

    // This object will contain the nested `.patient` data
    return fullAppointmentDetails;

  } catch (error) {
    console.error('Booking failed:', error);
    throw new Error('Could not create the appointment in the database.');
  }
};
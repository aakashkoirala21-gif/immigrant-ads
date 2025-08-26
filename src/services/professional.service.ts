import { Op } from 'sequelize';
import {
  Category,
  Payment,
  Professional,
  ProfessionalModel,
  Schedule,
  sequelize,
  User,
} from '../models';

export async function getMyProfile(userId: string) {
  const profile = await Professional.findByPk(userId, {
    include: [{ model: User, attributes: ['full_name', 'email', 'location'] }],
  });
  console.log('profile_______', profile);
  if (!profile) throw new Error('Professional profile not found');
  return profile;
}

// export async function getProfessionalPrice(
//   professional_id: string
// ): Promise<number | null> {
//   const pro = await Professional.findByPk(professional_id);
//   return pro?.price_per_slot ?? null;
// }

export async function updateMyProfile(userId: string, data: any) {
  const t = await sequelize.transaction(); 
  try {
    // 1. Find the professional and include the user
    const professional = await Professional.findByPk(userId, {
      include: [User],
      transaction: t,
    });

    if (!professional || !professional.User) {
      throw new Error('Profile not found');
    }

    // 2. Update the user record with user-specific data (e.g., location)
    await professional.User.update({ location: data.location }, { transaction: t });

    // 3. Update the professional record with professional-specific data (e.g., bio)
    await professional.update({ bio: data.bio }, { transaction: t });

    await t.commit(); // If both updates succeed, commit the changes
    
    return professional; // Return the updated profile

  } catch (error) {
    await t.rollback(); // If anything fails, undo all changes
    throw error; // Pass the error to the controller
  }
}

export async function getById(id: string) {
  const professional = await Professional.findByPk(id, {
    include: [{ model: User, attributes: ['full_name', 'email', 'location'] }],
  });
  if (!professional) throw new Error('Professional not found');
  return professional;
}

export async function approveProfessionalById(id: string) {
  const professional = await Professional.findByPk(id);
  if (!professional) throw new Error('Professional not found');
  await professional.update({ approved: true });
  return professional;
}

export async function listAllProfessionals(
  category_id?: string,
  location?: string
) {
  const includeUser = {
    model: User,
    attributes: [
      'full_name',
      'location',
      'profile_picture_url',
      'email',
      'phone',
    ],
    where: location ? { location } : undefined,
  };
  return Professional.findAll({
    where: {
      // approved: false,
      // approved: true,
      ...(category_id ? { category_id } : {}),
    },
    include: [includeUser],
    attributes: [
      'id',
      'license_number',
      'category_id',
      'bio',
      'is_paid',
      'approved',
    ],
    order: [['created_at', 'DESC']],
  });
}

/**
 * Creates or updates the availability for a professional.
 */
export const createOrUpdateSlot = async (
  professionalId: string,
  availabilityData: any[] // Expect an array of configurations
): Promise<ProfessionalModel> => {
  const professional = await Professional.findByPk(professionalId);

  if (!professional) {
    throw new Error('Professional not found.');
  }

  // Helper function to convert time strings like "9:00 AM" to minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = timeStr.match(timeRegex);

    if (!match) {
      // If the value is already a valid number, just return it.
      const num = parseInt(timeStr, 10);
      if (!isNaN(num)) return num;
      // Otherwise, throw an error for an invalid format.
      throw new Error(`Invalid time format: "${timeStr}". Please use "HH:MM AM/PM".`);
    }

    let [, hoursStr, minutesStr, modifier] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (modifier.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hours === 12) {
      hours = 0; // Handle midnight case (12:00 AM)
    }

    return hours * 60 + minutes;
  };

  // Process the incoming data to convert time_slots from strings to minutes
  const processedAvailability = availabilityData.map(config => {
    // Ensure time_slots exists and is an array before processing
    if (config.time_slots && Array.isArray(config.time_slots)) {
      return {
        ...config,
        time_slots: config.time_slots.map((slot: any) => {
          // Only attempt to parse if the slot is a string
          if (typeof slot === 'string') {
            return parseTimeToMinutes(slot);
          }
          // If it's already a number, keep it as is
          return slot;
        })
      };
    }
    // Return the config unmodified if it doesn't have a valid time_slots array
    return config;
  });

  professional.availability = processedAvailability;
  await professional.save();

  return professional;
};

/**
 * Gets all available slots for a professional within a given date range.
 */
export const getAvailableSlots = async (
  professionalId: string,
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  const professional = await Professional.findByPk(professionalId);
  if (
    !professional ||
    !professional.availability ||
    professional.availability.length === 0
  ) {
    throw new Error('Availability for this professional has not been set up.');
  }

  // The availability is now an array of slot configurations.
  const availabilityConfigurations = Array.isArray(professional.availability)
    ? professional.availability
    : [professional.availability];
  const slotDuration = 30; // Assuming this is a constant, or you could derive it from the configs.

  const existingAppointments = await Schedule.findAll({
    where: {
      professional_id: professionalId,
      start_time: { [Op.between]: [startDate, endDate] },
      status: { [Op.ne]: 'cancelled' },
    },
  });

  const bookedSlots = new Set(
    existingAppointments.map((appt) => appt.start_time.toISOString())
  );

  const potentialSlots = [];

  // Iterate over each availability configuration
  for (const config of availabilityConfigurations) {
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getUTCDay();

      // Check if the day is included in the current configuration
      if (config.day_of_week.includes(dayOfWeek)) {
        for (const timeSlot of config.time_slots) {
          const startHour = Math.floor(timeSlot / 60);
          const startMinute = timeSlot % 60;
          const slotTime = new Date(currentDate);

          // Use a library like 'luxon' or 'date-fns-tz' for timezone-aware calculations for production
          // For this example, we'll set it in UTC to match the current logic
          slotTime.setUTCHours(startHour, startMinute, 0, 0);

          if (
            slotTime >= startDate &&
            slotTime <= endDate &&
            !bookedSlots.has(slotTime.toISOString())
          ) {
            potentialSlots.push({
              start_time: slotTime.toISOString(),
              end_time: new Date(
                slotTime.getTime() + slotDuration * 60 * 1000
              ).toISOString(),
              price: config.price, // Use price from the current config
              currency: config.currency, // Use currency from the current config
              timezone: config.timezone, // Include timezone from the config
            });
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Remove duplicate slots that might be generated from overlapping configurations
  const uniqueSlots = Array.from(
    new Set(potentialSlots.map((slot) => JSON.stringify(slot)))
  ).map((slot) => JSON.parse(slot));

  return uniqueSlots;
};

/**
 * Gets all appointments for a given user (patient or professional).
 */
export const getAppointmentsForUser = async (
  userId: string
): Promise<any[]> => {
  const schedules = await Schedule.findAll({
    where: {
      [Op.or]: [{ user_id: userId }, { professional_id: userId }],
    },
    include: [
      {
        model: User,
        as: 'patient',
        attributes: ['id', 'full_name', 'email', 'profile_picture_url'],
      },
      {
        model: Professional,
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email', 'profile_picture_url'],
          },
        ],
      },
      {
        model: Payment,
        attributes: ['amount', 'pending_amount', 'payment_status', 'currency'],
      },
    ],
    order: [['start_time', 'ASC']],
  });

  if (!schedules || schedules.length === 0) {
    return []; // Return empty array if no appointments found
  }

  return schedules.map((s) => {
    // FIX: Cast s.toJSON() to 'any' to inform TypeScript about the included properties
    const scheduleJson = s.toJSON() as any;
    const professionalUser = scheduleJson.Professional?.User;

    return {
      id: scheduleJson.id,
      patient_details: scheduleJson.patient,
      professional_details: professionalUser,
      appointment_details: {
        start_time: scheduleJson.start_time,
        end_time: scheduleJson.end_time,
        status: scheduleJson.status,
        google_meet_url: scheduleJson.google_meet_url,
        symptoms: scheduleJson.symptoms,
        documents: scheduleJson.documents,
        final_report: scheduleJson.final_report,
      },
      payment_details: scheduleJson.Payment,
    };
  });
};

/**
 * Gets all appointments for a specific professional.
 * @param professionalId The ID of the professional.
 * @returns A list of appointments with patient details.
 */
export const getAppointmentsForProfessional = async (
  professionalId: string
) => {
  // Find all schedules matching the professional's ID
  const appointments = await Schedule.findAll({
    where: {
      professional_id: professionalId,
      status: { [Op.ne]: 'cancelled' }, // Optionally hide cancelled appointments
    },
    // Include the associated User model to get patient information
    include: [
      {
        model: User,
        as: 'patient', // Assuming you have set up this alias in your associations
        attributes: ['id', 'full_name', 'email', 'profile_picture_url'], // Select only the necessary fields
      },
    ],
    // Order the appointments by their start time
    order: [['start_time', 'ASC']],
  });

  return appointments;
};

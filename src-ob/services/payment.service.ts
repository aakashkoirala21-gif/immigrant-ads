import { Professional, Schedule } from "../models";
import { SlotConfiguration } from "../models/professional.model";

export async function createScheduleFromStripe(data: {
  user_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: 'confirmed';
}) {
  return Schedule.create({
    user_id: data.user_id,
    professional_id: data.professional_id,
    start_time: new Date(data.start_time),
    end_time: new Date(data.end_time),
    status: data.status,
  });
}
// export async function getSlotDetails(
//   professionalId: string,
//   startTime: string
// ): Promise<{ price: string; currency: string } | null> {
//   console.log(`\n--- Starting Slot Validation for professional: ${professionalId} ---`);
//   console.log(`Attempting to validate start_time: ${startTime}`);

//   // 1. Fetch the professional's data from the database.
//   const professional = await Professional.findByPk(professionalId);
//   if (!professional || !professional.availability) {
//     console.error('Validation failed: Professional not found or has no availability data.');
//     return null;
//   }

//   // 2. Ensure availability data is an array for safe iteration.
//   const availabilityConfigurations: SlotConfiguration[] = Array.isArray(professional.availability)
//     ? professional.availability
//     : [professional.availability];

//   const requestedStartTime = new Date(startTime);
//   console.log(`Parsed incoming UTC time as Date object: ${requestedStartTime.toISOString()}`);

//   // 3. Iterate through each availability configuration to find a match.
//   for (const config of availabilityConfigurations) {
//     console.log(`\nChecking against config with timezone: "${config.timezone}"`);
    
//     // 4. Use Intl.DateTimeFormat to reliably convert the UTC time to the professional's timezone.
//     const formatter = new Intl.DateTimeFormat('en-US', {
//       timeZone: config.timezone,
//       weekday: 'long',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//     });

//     const parts = formatter.formatToParts(requestedStartTime);
//     const dayOfWeekStr = parts.find(part => part.type === 'weekday')?.value;
//     const hourStr = parts.find(part => part.type === 'hour')?.value;
//     const minuteStr = parts.find(part => part.type === 'minute')?.value;
    
//     if (!dayOfWeekStr || !hourStr || !minuteStr) {
//         console.warn(`Could not extract all date parts for timezone ${config.timezone}. Skipping config.`);
//         continue; // Skip this configuration if date parts are missing
//     }

//     const dayMap: { [key: string]: number } = {
//       'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
//     };
    
//     const requestedDayOfWeek = dayMap[dayOfWeekStr];
//     const requestedMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr);

//     console.log(`Converted to local time (${config.timezone}): Day=${dayOfWeekStr}(${requestedDayOfWeek}), Time=${hourStr}:${minuteStr} (${requestedMinutes} mins)`);
//     console.log(`Database rules for this config: day_of_week=[${config.day_of_week.join(', ')}], time_slots=[${config.time_slots.join(', ')}]`);

//     // 5. Check if the converted day and time match a stored slot.
//     const isDayMatch = config.day_of_week.includes(requestedDayOfWeek);
//     const isTimeMatch = config.time_slots.includes(requestedMinutes);

//     console.log(`Checking for match: Is Day Match? ${isDayMatch}. Is Time Match? ${isTimeMatch}.`);

//     if (isDayMatch && isTimeMatch) {
//       // 6. Return the pricing details if a match is found.
//       console.log('✅ SUCCESS: Found a matching availability rule. Returning price and currency.');
//       return {
//         price: config.price,
//         currency: config.currency,
//       };
//     } else {
//       console.log('❌ NO MATCH: This configuration did not match the requested time.');
//     }
//   }

//   // 7. Return null if no matching slot is found after checking all configurations.
//   console.error('--- Validation Finished: No matching slot found in any configuration. Returning null. ---');
//   return null;
// }

export async function getSlotDetails(
  professionalId: string,
  startTime: string
): Promise<{ price: string; currency: string } | null> {
  // 1. Fetch the professional's data from the database.
  const professional = await Professional.findByPk(professionalId);
  if (!professional || !professional.availability) {
    return null;
  }

  // 2. Ensure availability data is an array for safe iteration.
  const availabilityConfigurations: SlotConfiguration[] = Array.isArray(professional.availability)
    ? professional.availability
    : [professional.availability];

  const requestedStartTime = new Date(startTime);

  // 3. Iterate through each availability configuration to find a match.
  for (const config of availabilityConfigurations) {
    // 4. Use Intl.DateTimeFormat to reliably convert the UTC time to the professional's timezone.
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: config.timezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(requestedStartTime);
    const dayOfWeekStr = parts.find(part => part.type === 'weekday')?.value;
    const hourStr = parts.find(part => part.type === 'hour')?.value;
    const minuteStr = parts.find(part => part.type === 'minute')?.value;
    
    if (!dayOfWeekStr || !hourStr || !minuteStr) {
        continue; // Skip this configuration if date parts are missing
    }

    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    
    const requestedDayOfWeek = dayMap[dayOfWeekStr];
    const requestedMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr);

    // 5. Check if the converted day and time match a stored slot.
    if (
      config.day_of_week.includes(requestedDayOfWeek) &&
      config.time_slots.includes(requestedMinutes)
    ) {
      // 6. Return the pricing details if a match is found.
      return {
        price: config.price,
        currency: config.currency,
      };
    }
  }

  // 7. Return null if no matching slot is found after checking all configurations.
  return null;
}
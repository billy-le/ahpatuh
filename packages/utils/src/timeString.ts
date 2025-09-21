export function timeStringToInt(timeString: string): number {
  const match = timeString.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error(
      `Invalid time format: ${timeString}. Expected HH:mm format.`,
    );
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours > 23 || minutes > 59) {
    throw new Error(
      `Invalid time: ${hours}:${minutes}. Hours must be 0-23, minutes must be 0-59.`,
    );
  }

  return hours * 100 + minutes;
}

export function intToTimeString(timeInt: number): string {
  if (timeInt < 0 || timeInt > 2359) {
    throw new Error(
      `Invalid time integer: ${timeInt}. Must be between 0 and 2359.`,
    );
  }

  const hours = Math.floor(timeInt / 100);
  const minutes = timeInt % 100;

  if (hours > 23 || minutes > 59) {
    throw new Error(
      `Invalid time: ${hours}:${minutes}. Hours must be 0-23, minutes must be 0-59.`,
    );
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Adds minutes to a time integer (HHMM format)
 * @param timeInt - Time in HHMM format (e.g., 1430 for 14:30)
 * @param minutes - Minutes to add
 * @returns New time integer in HHMM format
 */
export function addMinutesToTimeInt(timeInt: number, minutes: number): number {
  if (timeInt < 0 || timeInt > 2359) {
    throw new Error(
      `Invalid time integer: ${timeInt}. Must be between 0 and 2359.`,
    );
  }

  const hours = Math.floor(timeInt / 100);
  const mins = timeInt % 100;

  if (hours > 23 || mins > 59) {
    throw new Error(
      `Invalid time: ${hours}:${mins}. Hours must be 0-23, minutes must be 0-59.`,
    );
  }

  // Convert to total minutes
  const totalMinutes = hours * 60 + mins + minutes;

  // Handle day overflow (wrap around to next day)
  const newTotalMinutes = totalMinutes % (24 * 60);

  // Convert back to HHMM format
  const newHours = Math.floor(newTotalMinutes / 60);
  const newMins = newTotalMinutes % 60;

  return newHours * 100 + newMins;
}

/**
 * Subtracts minutes from a time integer (HHMM format)
 * @param timeInt - Time in HHMM format (e.g., 1430 for 14:30)
 * @param minutes - Minutes to subtract
 * @returns New time integer in HHMM format
 */
export function subtractMinutesFromTimeInt(
  timeInt: number,
  minutes: number,
): number {
  if (timeInt < 0 || timeInt > 2359) {
    throw new Error(
      `Invalid time integer: ${timeInt}. Must be between 0 and 2359.`,
    );
  }

  const hours = Math.floor(timeInt / 100);
  const mins = timeInt % 100;

  if (hours > 23 || mins > 59) {
    throw new Error(
      `Invalid time: ${hours}:${mins}. Hours must be 0-23, minutes must be 0-59.`,
    );
  }

  // Convert to total minutes
  const totalMinutes = hours * 60 + mins - minutes;

  // Handle negative time (wrap around to previous day)
  const newTotalMinutes =
    totalMinutes < 0
      ? 24 * 60 + (totalMinutes % (24 * 60))
      : totalMinutes % (24 * 60);

  // Convert back to HHMM format
  const newHours = Math.floor(newTotalMinutes / 60);
  const newMins = newTotalMinutes % 60;

  return newHours * 100 + newMins;
}

/**
 * Calculates the difference in minutes between two time integers
 * @param startTime - Start time in HHMM format
 * @param endTime - End time in HHMM format
 * @returns Difference in minutes (positive if endTime > startTime)
 */
export function getMinutesDifference(
  startTime: number,
  endTime: number,
): number {
  const startHours = Math.floor(startTime / 100);
  const startMins = startTime % 100;
  const endHours = Math.floor(endTime / 100);
  const endMins = endTime % 100;

  const startTotalMins = startHours * 60 + startMins;
  const endTotalMins = endHours * 60 + endMins;

  return endTotalMins - startTotalMins;
}

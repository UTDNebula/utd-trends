/**
 * Utility functions for time parsing and manipulation
 */

// Days of the week (0 = Sunday, 1 = Monday, etc.)
export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Parses a time string and meeting days into a comparable numeric value
 * @param time - Time string in format "HH:MMam/pm" (e.g., "2:30pm")
 * @param days - Array of day names (e.g., ["Monday", "Wednesday"])
 * @returns Numeric value representing the time in minutes from start of week
 */
export function parseTime(time: string, days: string[]): number {
  const [hour, minute] = time.split(':');
  const isPM = time.includes('pm');
  let hour24 = parseInt(hour);
  if (isPM && hour24 !== 12) hour24 += 12;
  if (!isPM && hour24 === 12) hour24 = 0;

  // Get the earliest day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayValues = days
    .map((day) => DAYS.indexOf(day))
    .filter((val) => val !== -1);
  const earliestDay = dayValues.length > 0 ? Math.min(...dayValues) : 0;

  // Combine day and time: day * 24 * 60 + time in minutes
  return earliestDay * 24 * 60 + hour24 * 60 + parseInt(minute.slice(0, 2));
}
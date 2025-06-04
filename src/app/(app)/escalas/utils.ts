
// src/app/(app)/escalas/utils.ts

/**
 * Parses a date string in "YYYY-MM-DD" format into a Date object in UTC.
 * Returns null if the date string is invalid.
 */
export function parseDateUTC(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    // Create date in UTC to avoid timezone issues during parsing and calculations
    return new Date(Date.UTC(year, month - 1, day));
  }
  return null;
}

/**
 * Calculates the difference in days between two Date objects, treating them as UTC.
 * date1 is the later date, date2 is the earlier date.
 * Returns Infinity if either date is invalid.
 */
export function diffInDaysUTC(date1: Date | null, date2: Date | null): number {
  if (!date1 || !date2) return Infinity;
  const oneDay = 1000 * 60 * 60 * 24;
  // Ensure we are comparing based on UTC midnight to get full day differences
  const utc1 = Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
  const utc2 = Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());
  return Math.floor((utc1 - utc2) / oneDay);
}

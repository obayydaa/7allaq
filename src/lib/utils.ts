import { format, parse, addMinutes, isBefore, isAfter, isEqual } from 'date-fns';

/**
 * Format a date string (YYYY-MM-DD) for display
 */
export function formatDate(dateStr: string, locale: string = 'en'): string {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (locale === 'ar') {
    return format(date, 'dd/MM/yyyy');
  }
  return format(date, 'MMM dd, yyyy');
}

/**
 * Format time from 24h to 12h display
 */
export function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generate time slots between start and end times
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number = 30
): string[] {
  const slots: string[] = [];
  const baseDate = new Date(2000, 0, 1);
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = new Date(baseDate);
  current.setHours(startH, startM, 0, 0);

  const end = new Date(baseDate);
  end.setHours(endH, endM, 0, 0);

  while (isBefore(current, end) || isEqual(current, end)) {
    const slotEnd = addMinutes(current, slotDuration);
    if (isAfter(slotEnd, end)) break;
    
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, slotDuration);
  }

  return slots;
}

/**
 * Check if a time slot overlaps with a booking
 */
export function doesSlotOverlap(
  slotTime: string,
  slotDuration: number,
  bookingTime: string,
  bookingDuration: number
): boolean {
  const baseDate = new Date(2000, 0, 1);
  
  const [sh, sm] = slotTime.split(':').map(Number);
  const slotStart = new Date(baseDate);
  slotStart.setHours(sh, sm, 0, 0);
  const slotEnd = addMinutes(slotStart, slotDuration);

  const [bh, bm] = bookingTime.split(':').map(Number);
  const bookingStart = new Date(baseDate);
  bookingStart.setHours(bh, bm, 0, 0);
  const bookingEnd = addMinutes(bookingStart, bookingDuration);

  // Overlap exists if slot starts before booking ends AND slot ends after booking starts
  return isBefore(slotStart, bookingEnd) && isAfter(slotEnd, bookingStart);
}

/**
 * Validate Jordanian phone number (must start with 07, 10 digits total)
 */
export function validateJordanianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  return /^07\d{8}$/.test(cleaned);
}

/**
 * Format phone for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Get day name from dayOfWeek number
 */
export function getDayName(dayOfWeek: number, locale: string = 'en'): string {
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return locale === 'ar' ? daysAr[dayOfWeek] : daysEn[dayOfWeek];
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Generate the next N days as date strings
 */
export function getNextNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(format(date, 'yyyy-MM-dd'));
  }
  return days;
}

/**
 * Status color mapping
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'confirmed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

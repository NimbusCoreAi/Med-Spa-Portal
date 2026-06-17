export interface TimeSlot {
  start: number;
  end: number;
}

export interface AvailabilityRange {
  start: string;
  end: string;
}

/**
 * Generate all possible time slots for a date given availability ranges.
 * Pure function — no database access.
 */
export function generateTimeSlots(
  date: string,
  ranges: AvailabilityRange[],
  slotDurationMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const slotMs = slotDurationMinutes * 60_000;

  for (const range of ranges) {
    const rangeStart = new Date(`${date}T${range.start}:00.000Z`).getTime();
    const rangeEnd = new Date(`${date}T${range.end}:00.000Z`).getTime();

    for (let slotStart = rangeStart; slotStart + slotMs <= rangeEnd; slotStart += slotMs) {
      slots.push({ start: slotStart, end: slotStart + slotMs });
    }
  }

  return slots;
}

/**
 * Check if a time slot overlaps with any booked slots.
 * Pure function — no database access.
 */
export function isSlotAvailable(
  slotStart: number,
  slotEnd: number,
  bookedSlots: TimeSlot[]
): boolean {
  return !bookedSlots.some((b) => slotStart < b.end && slotEnd > b.start);
}

/**
 * Filter out booked slots from all possible slots.
 * Pure function — no database access.
 */
export function filterAvailableSlots(
  allSlots: TimeSlot[],
  bookedSlots: TimeSlot[]
): TimeSlot[] {
  return allSlots.filter((slot) => isSlotAvailable(slot.start, slot.end, bookedSlots));
}

/**
 * Parse availability config from "09:00-17:00" format to structured ranges.
 */
export function parseAvailabilityConfig(
  availability: Record<string, string[]>
): Record<string, AvailabilityRange[]> {
  const parsed: Record<string, AvailabilityRange[]> = {};
  for (const [day, ranges] of Object.entries(availability)) {
    parsed[day] = ranges.map((range) => {
      const [start, end] = range.split('-');
      return { start: start.trim(), end: end.trim() };
    });
  }
  return parsed;
}

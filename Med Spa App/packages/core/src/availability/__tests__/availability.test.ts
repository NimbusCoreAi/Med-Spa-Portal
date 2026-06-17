import { generateTimeSlots, isSlotAvailable, filterAvailableSlots, parseAvailabilityConfig } from '../index';

describe('availability module', () => {
  describe('generateTimeSlots', () => {
    it('generates slots for a single range', () => {
      const slots = generateTimeSlots('2024-01-15', [{ start: '09:00', end: '10:00' }], 30);
      expect(slots).toHaveLength(2);
      expect(slots[0].end - slots[0].start).toBe(30 * 60_000);
    });

    it('generates slots for multiple ranges', () => {
      const slots = generateTimeSlots('2024-01-15', [
        { start: '09:00', end: '10:00' },
        { start: '14:00', end: '15:00' },
      ], 60);
      expect(slots).toHaveLength(2);
    });

    it('returns empty for empty ranges', () => {
      const slots = generateTimeSlots('2024-01-15', [], 30);
      expect(slots).toHaveLength(0);
    });
  });

  describe('isSlotAvailable', () => {
    it('returns true when no conflicts', () => {
      const booked = [{ start: 1000, end: 2000 }];
      expect(isSlotAvailable(3000, 4000, booked)).toBe(true);
    });

    it('returns false when fully overlapping', () => {
      const booked = [{ start: 1000, end: 2000 }];
      expect(isSlotAvailable(1000, 2000, booked)).toBe(false);
    });

    it('returns false when partially overlapping', () => {
      const booked = [{ start: 1000, end: 2000 }];
      expect(isSlotAvailable(1500, 2500, booked)).toBe(false);
    });

    it('handles adjacent slots correctly', () => {
      const booked = [{ start: 1000, end: 2000 }];
      expect(isSlotAvailable(2000, 3000, booked)).toBe(true);
    });
  });

  describe('filterAvailableSlots', () => {
    it('filters out conflicting slots', () => {
      const all = [
        { start: 1000, end: 2000 },
        { start: 2000, end: 3000 },
        { start: 3000, end: 4000 },
      ];
      const booked = [{ start: 1000, end: 2000 }];
      const available = filterAvailableSlots(all, booked);
      expect(available).toHaveLength(2);
    });
  });

  describe('parseAvailabilityConfig', () => {
    it('parses availability ranges', () => {
      const parsed = parseAvailabilityConfig({
        monday: ['09:00-17:00'],
        tuesday: ['09:00-12:00', '14:00-17:00'],
      });
      expect(parsed.monday).toEqual([{ start: '09:00', end: '17:00' }]);
      expect(parsed.tuesday).toEqual([
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ]);
    });
  });
});

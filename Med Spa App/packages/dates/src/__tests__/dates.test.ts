import {
  startOfWeek,
  endOfWeek,
  addDays,
  addMinutes,
  isSameDay,
  isToday,
  getDayName,
  DAY_NAMES,
  DATE_RANGE_PRESETS,
  getDateRange,
} from '../index';

describe('dates module', () => {
  describe('startOfWeek', () => {
    it('returns Monday of the same week', () => {
      const wednesday = new Date(Date.UTC(2024, 0, 17)); // Wed Jan 17 2024
      const monday = startOfWeek(wednesday);
      expect(monday.getUTCDate()).toBe(15); // Mon Jan 15
      expect(monday.getUTCDay()).toBe(1); // Monday
    });
  });

  describe('endOfWeek', () => {
    it('returns Sunday at end of day', () => {
      const monday = new Date(Date.UTC(2024, 0, 15));
      const end = endOfWeek(monday);
      expect(end.getUTCDate()).toBe(21); // Sunday
      expect(end.getUTCHours()).toBe(23);
    });
  });

  describe('addDays', () => {
    it('adds days correctly', () => {
      const d = new Date(Date.UTC(2024, 0, 15));
      const result = addDays(d, 5);
      expect(result.getUTCDate()).toBe(20);
    });

    it('handles negative days', () => {
      const d = new Date(Date.UTC(2024, 0, 15));
      const result = addDays(d, -5);
      expect(result.getUTCDate()).toBe(10);
    });
  });

  describe('addMinutes', () => {
    it('adds minutes correctly', () => {
      const d = new Date(Date.UTC(2024, 0, 15, 10, 0));
      const result = addMinutes(d, 30);
      expect(result.getUTCMinutes()).toBe(30);
    });
  });

  describe('isSameDay', () => {
    it('returns true for same day', () => {
      const d1 = new Date(Date.UTC(2024, 0, 15, 10, 0));
      const d2 = new Date(Date.UTC(2024, 0, 15, 14, 0));
      expect(isSameDay(d1, d2)).toBe(true);
    });

    it('returns false for different days', () => {
      const d1 = new Date(Date.UTC(2024, 0, 15));
      const d2 = new Date(Date.UTC(2024, 0, 16));
      expect(isSameDay(d1, d2)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('returns true for current date', () => {
      expect(isToday(new Date())).toBe(true);
    });
  });

  describe('getDayName', () => {
    it('returns the correct day name', () => {
      expect(getDayName(new Date(Date.UTC(2024, 0, 15)))).toBe('monday');
      expect(getDayName(new Date(Date.UTC(2024, 0, 16)))).toBe('tuesday');
    });
  });

  describe('DATE_RANGE_PRESETS', () => {
    it('contains all expected presets', () => {
      expect(DATE_RANGE_PRESETS.this_month).toBe('This Month');
      expect(DATE_RANGE_PRESETS.last_month).toBe('Last Month');
      expect(DATE_RANGE_PRESETS.ytd).toBe('Year to Date');
    });
  });

  describe('getDateRange', () => {
    it('returns this_month with from only', () => {
      const result = getDateRange('this_month');
      expect(result.from).toBeDefined();
      expect(result.to).toBeUndefined();
    });

    it('returns last_month with from and to', () => {
      const result = getDateRange('last_month');
      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
    });

    it('returns ytd with from only', () => {
      const result = getDateRange('ytd');
      expect(result.from).toBeDefined();
      expect(result.to).toBeUndefined();
    });
  });
});

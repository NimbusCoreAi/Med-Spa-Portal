import {
  snakeToCamel,
  camelToSnake,
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  cn,
  getDateRange,
  DateRangePreset,
} from '../index';

describe('utils module', () => {
  describe('snakeToCamel', () => {
    it('converts snake_case to camelCase', () => {
      expect(snakeToCamel('clinic_id')).toBe('clinicId');
      expect(snakeToCamel('payment_status')).toBe('paymentStatus');
    });

    it('leaves non-snake strings unchanged', () => {
      expect(snakeToCamel('name')).toBe('name');
    });
  });

  describe('camelToSnake', () => {
    it('converts camelCase to snake_case', () => {
      expect(camelToSnake('clinicId')).toBe('clinic_id');
      expect(camelToSnake('paymentStatus')).toBe('payment_status');
    });
  });

  describe('formatCurrency', () => {
    it('formats cents to dollars', () => {
      expect(formatCurrency(1500)).toBe('$15.00');
      expect(formatCurrency(99)).toBe('$0.99');
    });
  });

  describe('cn', () => {
    it('joins truthy classes', () => {
      expect(cn('a', 'b', undefined, false, null, 'c')).toBe('a b c');
    });

    it('returns empty string for all falsy', () => {
      expect(cn(undefined, false, null)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats a date string', () => {
      const result = formatDate('2024-01-15T10:00:00Z');
      expect(result).toMatch(/2024/);
    });
  });

  describe('formatTime', () => {
    it('formats a date string', () => {
      const result = formatTime('2024-01-15T10:00:00Z');
      expect(result).toMatch(/\d/);
    });
  });

  describe('formatDateTime', () => {
    it('combines date and time', () => {
      const result = formatDateTime('2024-01-15T10:00:00Z');
      expect(result).toContain('2024');
    });
  });

  describe('getDateRange', () => {
    it('returns this_month range', () => {
      const result = getDateRange('this_month');
      expect(result.from).toBeDefined();
      expect(result.to).toBeUndefined();
      expect(result.label).toBe('This Month');
    });

    it('returns last_month range', () => {
      const result = getDateRange('last_month');
      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
      expect(result.label).toBe('Last Month');
    });

    it('returns ytd range', () => {
      const result = getDateRange('ytd');
      expect(result.from).toBeDefined();
      expect(result.to).toBeUndefined();
      expect(result.label).toBe('Year to Date');
    });
  });
});

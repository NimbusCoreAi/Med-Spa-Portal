import {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  PaymentError,
  errorToResponse,
  errorToStatus,
} from '../index';

describe('errors module', () => {
  describe('AppError', () => {
    it('creates with default status 500', () => {
      const err = new AppError('something broke');
      expect(err.message).toBe('something broke');
      expect(err.statusCode).toBe(500);
      expect(err.name).toBe('AppError');
    });

    it('creates with custom status and code', () => {
      const err = new AppError('custom', 418, 'IM_A_TEAPOT');
      expect(err.statusCode).toBe(418);
      expect(err.code).toBe('IM_A_TEAPOT');
    });
  });

  describe('ValidationError', () => {
    it('has 400 status', () => {
      const err = new ValidationError('bad input');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('AuthError', () => {
    it('has 401 status and default message', () => {
      const err = new AuthError();
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Unauthorized');
    });
  });

  describe('ForbiddenError', () => {
    it('has 403 status', () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('has 404 status and includes resource name', () => {
      const err = new NotFoundError('Patient');
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Patient not found');
    });
  });

  describe('ConflictError', () => {
    it('has 409 status', () => {
      const err = new ConflictError('double booked');
      expect(err.statusCode).toBe(409);
    });
  });

  describe('PaymentError', () => {
    it('has 402 status', () => {
      const err = new PaymentError('card declined');
      expect(err.statusCode).toBe(402);
    });
  });

  describe('errorToResponse', () => {
    it('converts AppError with details', () => {
      const err = new ValidationError('bad', { field: 'email' });
      const res = errorToResponse(err);
      expect(res.error).toBe('bad');
      expect(res.details).toEqual({ field: 'email' });
    });

    it('converts plain Error', () => {
      const res = errorToResponse(new Error('oops'));
      expect(res.error).toBe('oops');
      expect(res.details).toBeUndefined();
    });

    it('converts unknown', () => {
      const res = errorToResponse('something');
      expect(res.error).toBe('An unexpected error occurred');
    });
  });

  describe('errorToStatus', () => {
    it('returns status from AppError', () => {
      expect(errorToStatus(new ValidationError('x'))).toBe(400);
    });

    it('returns 500 for non-AppError', () => {
      expect(errorToStatus(new Error('x'))).toBe(500);
    });
  });
});

const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom
  }))
}));

import {
  createProvider,
  getProviders,
  createRoom,
  getRooms,
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  setAppointmentPaymentLink,
  updateAppointmentPaymentStatus,
  getAvailableSlots
} from '../index';

describe('scheduling module', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    jest.clearAllMocks();
  });

  describe('createProvider', () => {
    it('inserts a new provider and returns it', async () => {
      const provider = { id: 'provider-1', clinic_id: 'clinic-1', name: 'Dr. Smith' };
      const single = jest.fn().mockResolvedValue({ data: provider, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const result = await createProvider({ clinicId: 'clinic-1', name: 'Dr. Smith' });

      expect(mockFrom).toHaveBeenCalledWith('providers');
      expect(insert).toHaveBeenCalledWith({
        clinic_id: 'clinic-1',
        name: 'Dr. Smith',
        specialties: [],
        availability: {}
      });
      expect(result).toEqual(provider);
    });

    it('throws when insert fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      await expect(createProvider({ clinicId: 'clinic-1', name: 'Dr. Smith' })).rejects.toThrow(
        'Create provider failed: DB error'
      );
    });
  });

  describe('getProviders', () => {
    it('returns providers for a clinic', async () => {
      const providers = [{ id: 'provider-1', clinic_id: 'clinic-1', name: 'Dr. Smith' }];
      const order = jest.fn().mockResolvedValue({ data: providers, error: null });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getProviders('clinic-1');

      expect(eq).toHaveBeenCalledWith('clinic_id', 'clinic-1');
      expect(result).toEqual(providers);
    });

    it('throws when fetch fails', async () => {
      const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getProviders('clinic-1')).rejects.toThrow('Fetch providers failed: DB error');
    });
  });

  describe('createRoom', () => {
    it('inserts a new room and returns it', async () => {
      const room = { id: 'room-1', clinic_id: 'clinic-1', name: 'Room A', capacity: 1 };
      const single = jest.fn().mockResolvedValue({ data: room, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const result = await createRoom({ clinicId: 'clinic-1', name: 'Room A', capacity: 1 });

      expect(mockFrom).toHaveBeenCalledWith('rooms');
      expect(result).toEqual(room);
    });

    it('throws when insert fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      await expect(createRoom({ clinicId: 'clinic-1', name: 'Room A' })).rejects.toThrow(
        'Create room failed: DB error'
      );
    });
  });

  describe('getRooms', () => {
    it('returns rooms for a clinic', async () => {
      const rooms = [{ id: 'room-1', clinic_id: 'clinic-1', name: 'Room A' }];
      const order = jest.fn().mockResolvedValue({ data: rooms, error: null });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getRooms('clinic-1');

      expect(eq).toHaveBeenCalledWith('clinic_id', 'clinic-1');
      expect(result).toEqual(rooms);
    });

    it('throws when fetch fails', async () => {
      const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getRooms('clinic-1')).rejects.toThrow('Fetch rooms failed: DB error');
    });
  });

  describe('createAppointment', () => {
    const params = {
      clinicId: 'clinic-1',
      patientId: 'patient-1',
      providerId: 'provider-1',
      scheduledTime: '2026-07-01T09:00:00.000Z',
      durationMinutes: 30
    };

    it('inserts a new appointment and returns it', async () => {
      const appointment = { id: 'appt-1', ...params, status: 'scheduled' };
      const single = jest.fn().mockResolvedValue({ data: appointment, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const result = await createAppointment(params);

      expect(mockFrom).toHaveBeenCalledWith('appointments');
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({ clinic_id: 'clinic-1', patient_id: 'patient-1', status: 'scheduled' })
      );
      expect(result).toEqual(appointment);
    });

    it('throws a conflict error when the provider already has an overlapping appointment', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { code: '23P01', message: 'conflict' } });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      await expect(createAppointment(params)).rejects.toThrow(
        'Create appointment failed: provider is already booked for this time slot'
      );
    });

    it('throws a generic error on other failures', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      await expect(createAppointment(params)).rejects.toThrow('Create appointment failed: DB error');
    });
  });

  describe('getAppointments', () => {
    it('returns appointments for a clinic within a date range', async () => {
      const appointments = [{ id: 'appt-1', clinic_id: 'clinic-1' }];
      const order = jest.fn().mockResolvedValue({ data: appointments, error: null });
      const lte = jest.fn().mockReturnValue({ order });
      const gte = jest.fn().mockReturnValue({ lte });
      const eq = jest.fn().mockReturnValue({ gte });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getAppointments({ clinicId: 'clinic-1', from: '2026-07-01', to: '2026-07-31' });

      expect(eq).toHaveBeenCalledWith('clinic_id', 'clinic-1');
      expect(gte).toHaveBeenCalledWith('scheduled_time', '2026-07-01');
      expect(lte).toHaveBeenCalledWith('scheduled_time', '2026-07-31');
      expect(result).toEqual(appointments);
    });

    it('returns appointments for a clinic without a date range', async () => {
      const appointments = [{ id: 'appt-1', clinic_id: 'clinic-1' }];
      const order = jest.fn().mockResolvedValue({ data: appointments, error: null });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getAppointments({ clinicId: 'clinic-1' });

      expect(result).toEqual(appointments);
    });

    it('throws when fetch fails', async () => {
      const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getAppointments({ clinicId: 'clinic-1' })).rejects.toThrow(
        'Fetch appointments failed: DB error'
      );
    });
  });

  describe('updateAppointmentStatus', () => {
    it('updates and returns the appointment', async () => {
      const updated = { id: 'appt-1', status: 'completed' };
      const single = jest.fn().mockResolvedValue({ data: updated, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      const result = await updateAppointmentStatus('appt-1', 'completed');

      expect(update).toHaveBeenCalledWith({ status: 'completed' });
      expect(eq).toHaveBeenCalledWith('id', 'appt-1');
      expect(result).toEqual(updated);
    });

    it('throws when update fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      await expect(updateAppointmentStatus('appt-1', 'cancelled')).rejects.toThrow(
        'Update appointment status failed: DB error'
      );
    });
  });

  describe('setAppointmentPaymentLink', () => {
    it('updates and returns the appointment with the payment link', async () => {
      const updated = { id: 'appt-1', payment_link_url: 'https://stripe.com/pay/plink_1' };
      const single = jest.fn().mockResolvedValue({ data: updated, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      const result = await setAppointmentPaymentLink('appt-1', 'https://stripe.com/pay/plink_1');

      expect(update).toHaveBeenCalledWith({ payment_link_url: 'https://stripe.com/pay/plink_1' });
      expect(eq).toHaveBeenCalledWith('id', 'appt-1');
      expect(result).toEqual(updated);
    });

    it('includes the amount when provided', async () => {
      const updated = { id: 'appt-1', payment_link_url: 'https://stripe.com/pay/plink_1', amount: 150 };
      const single = jest.fn().mockResolvedValue({ data: updated, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      await setAppointmentPaymentLink('appt-1', 'https://stripe.com/pay/plink_1', 150);

      expect(update).toHaveBeenCalledWith({ payment_link_url: 'https://stripe.com/pay/plink_1', amount: 150 });
    });

    it('throws when update fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      await expect(setAppointmentPaymentLink('appt-1', 'https://stripe.com/pay/plink_1')).rejects.toThrow(
        'Set appointment payment link failed: DB error'
      );
    });
  });

  describe('updateAppointmentPaymentStatus', () => {
    it('marks the appointment completed and stamps payment_completed_at', async () => {
      const updated = { id: 'appt-1', payment_status: 'completed', payment_completed: true };
      const single = jest.fn().mockResolvedValue({ data: updated, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const neq = jest.fn().mockReturnValue({ select });
      const eq = jest.fn().mockReturnValue({ neq });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      const result = await updateAppointmentPaymentStatus('appt-1', 'completed');

      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ payment_status: 'completed', payment_completed: true })
      );
      expect(neq).toHaveBeenCalledWith('payment_status', 'completed');
      expect(result).toEqual(updated);
    });

    it('marks the appointment failed without a completed timestamp', async () => {
      const updated = { id: 'appt-1', payment_status: 'failed', payment_completed: false };
      const single = jest.fn().mockResolvedValue({ data: updated, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const neq = jest.fn().mockReturnValue({ select });
      const eq = jest.fn().mockReturnValue({ neq });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      await updateAppointmentPaymentStatus('appt-1', 'failed');

      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ payment_status: 'failed', payment_completed: false, payment_completed_at: null })
      );
    });

    it('throws when update fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const neq = jest.fn().mockReturnValue({ select });
      const eq = jest.fn().mockReturnValue({ neq });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      await expect(updateAppointmentPaymentStatus('appt-1', 'completed')).rejects.toThrow(
        'Update appointment payment status failed: DB error'
      );
    });
  });

  describe('getAvailableSlots', () => {
    function mockProviderAndAppointments(availability: Record<string, string[]>, existing: unknown[]) {
      const providerSingle = jest.fn().mockResolvedValue({ data: { availability }, error: null });
      const providerEq = jest.fn().mockReturnValue({ single: providerSingle });
      const providerSelect = jest.fn().mockReturnValue({ eq: providerEq });

      const appointmentsLte = jest.fn().mockResolvedValue({ data: existing, error: null });
      const appointmentsGte = jest.fn().mockReturnValue({ lte: appointmentsLte });
      const appointmentsNeq = jest.fn().mockReturnValue({ gte: appointmentsGte });
      const appointmentsEq = jest.fn().mockReturnValue({ neq: appointmentsNeq });
      const appointmentsSelect = jest.fn().mockReturnValue({ eq: appointmentsEq });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'providers') return { select: providerSelect };
        return { select: appointmentsSelect };
      });
    }

    it('returns empty slots when the provider has no availability that day', async () => {
      mockProviderAndAppointments({}, []);

      const result = await getAvailableSlots({
        providerId: 'provider-1',
        date: '2026-07-06', // a Monday
        durationMinutes: 30
      });

      expect(result).toEqual([]);
    });

    it('returns slots for the day, excluding conflicts', async () => {
      mockProviderAndAppointments({ monday: ['09:00-10:00'] }, [
        { scheduled_time: '2026-07-06T09:00:00.000Z', duration_minutes: 30 }
      ]);

      const result = await getAvailableSlots({
        providerId: 'provider-1',
        date: '2026-07-06',
        durationMinutes: 30
      });

      expect(result).toEqual(['2026-07-06T09:30:00.000Z']);
    });

    it('throws when fetching provider availability fails', async () => {
      const providerSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const providerEq = jest.fn().mockReturnValue({ single: providerSingle });
      const providerSelect = jest.fn().mockReturnValue({ eq: providerEq });
      mockFrom.mockReturnValue({ select: providerSelect });

      await expect(
        getAvailableSlots({ providerId: 'provider-1', date: '2026-07-06', durationMinutes: 30 })
      ).rejects.toThrow('Fetch provider availability failed: DB error');
    });
  });
});

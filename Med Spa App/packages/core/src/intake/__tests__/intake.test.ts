const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom
  }))
}));

import {
  createIntakeForm,
  getIntakeForms,
  getIntakeForm,
  updateIntakeForm,
  submitIntake,
  getIntakeSubmissions,
  getIntakeStatusForAppointment
} from '../index';

describe('intake module', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    jest.clearAllMocks();
  });

  describe('createIntakeForm', () => {
    it('inserts a new intake form and returns it', async () => {
      const form = { id: 'form-1', clinic_id: 'clinic-1', name: 'New Patient', fields: [] };
      const single = jest.fn().mockResolvedValue({ data: form, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const result = await createIntakeForm({ clinicId: 'clinic-1', name: 'New Patient', fields: [] });

      expect(mockFrom).toHaveBeenCalledWith('intake_forms');
      expect(insert).toHaveBeenCalledWith({ clinic_id: 'clinic-1', name: 'New Patient', fields: [] });
      expect(result).toEqual(form);
    });

    it('throws when insert fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      await expect(
        createIntakeForm({ clinicId: 'clinic-1', name: 'New Patient', fields: [] })
      ).rejects.toThrow('Create intake form failed: DB error');
    });
  });

  describe('getIntakeForms', () => {
    it('returns forms for a clinic ordered by creation date', async () => {
      const forms = [{ id: 'form-1', clinic_id: 'clinic-1', name: 'New Patient', fields: [] }];
      const order = jest.fn().mockResolvedValue({ data: forms, error: null });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getIntakeForms('clinic-1');

      expect(mockFrom).toHaveBeenCalledWith('intake_forms');
      expect(eq).toHaveBeenCalledWith('clinic_id', 'clinic-1');
      expect(result).toEqual(forms);
    });

    it('throws when fetch fails', async () => {
      const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getIntakeForms('clinic-1')).rejects.toThrow('Fetch intake forms failed: DB error');
    });
  });

  describe('getIntakeForm', () => {
    it('returns a single form by id', async () => {
      const form = { id: 'form-1', clinic_id: 'clinic-1', name: 'New Patient', fields: [] };
      const single = jest.fn().mockResolvedValue({ data: form, error: null });
      const eq = jest.fn().mockReturnValue({ single });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getIntakeForm('form-1');

      expect(eq).toHaveBeenCalledWith('id', 'form-1');
      expect(result).toEqual(form);
    });

    it('throws when fetch fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
      const eq = jest.fn().mockReturnValue({ single });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getIntakeForm('missing')).rejects.toThrow('Fetch intake form failed: not found');
    });
  });

  describe('updateIntakeForm', () => {
    it('updates and returns the form', async () => {
      const updated = { id: 'form-1', clinic_id: 'clinic-1', name: 'Updated', fields: [] };
      const single = jest.fn().mockResolvedValue({ data: updated, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      const result = await updateIntakeForm('form-1', { name: 'Updated' });

      expect(update).toHaveBeenCalledWith({ name: 'Updated' });
      expect(eq).toHaveBeenCalledWith('id', 'form-1');
      expect(result).toEqual(updated);
    });

    it('throws when update fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const eq = jest.fn().mockReturnValue({ select });
      const update = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update });

      await expect(updateIntakeForm('form-1', { name: 'Updated' })).rejects.toThrow(
        'Update intake form failed: DB error'
      );
    });
  });

  describe('submitIntake', () => {
    it('marks submission completed when consent is signed', async () => {
      const submission = { id: 'sub-1', status: 'completed', signed_consent: true };
      const single = jest.fn().mockResolvedValue({ data: submission, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const result = await submitIntake({
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        formId: 'form-1',
        responses: { name: 'Jane' },
        signedConsent: true
      });

      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed', signed_consent: true })
      );
      expect(result).toEqual(submission);
    });

    it('marks submission in_progress when consent is not signed', async () => {
      const submission = { id: 'sub-1', status: 'in_progress', signed_consent: false };
      const single = jest.fn().mockResolvedValue({ data: submission, error: null });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      await submitIntake({
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        formId: 'form-1',
        responses: { name: 'Jane' },
        signedConsent: false
      });

      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'in_progress', signed_consent: false, signed_at: null })
      );
    });

    it('throws when insert fails', async () => {
      const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const select = jest.fn().mockReturnValue({ single });
      const insert = jest.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      await expect(
        submitIntake({
          clinicId: 'clinic-1',
          patientId: 'patient-1',
          formId: 'form-1',
          responses: {},
          signedConsent: true
        })
      ).rejects.toThrow('Submit intake failed: DB error');
    });
  });

  describe('getIntakeSubmissions', () => {
    it('returns submissions for a clinic', async () => {
      const submissions = [{ id: 'sub-1', clinic_id: 'clinic-1' }];
      const order = jest.fn().mockResolvedValue({ data: submissions, error: null });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getIntakeSubmissions('clinic-1');

      expect(eq).toHaveBeenCalledWith('clinic_id', 'clinic-1');
      expect(result).toEqual(submissions);
    });

    it('throws when fetch fails', async () => {
      const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const eq = jest.fn().mockReturnValue({ order });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getIntakeSubmissions('clinic-1')).rejects.toThrow(
        'Fetch intake submissions failed: DB error'
      );
    });
  });

  describe('getIntakeStatusForAppointment', () => {
    it('returns the submission status when one exists', async () => {
      const maybeSingle = jest.fn().mockResolvedValue({ data: { status: 'completed' }, error: null });
      const eq = jest.fn().mockReturnValue({ maybeSingle });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getIntakeStatusForAppointment('appt-1');

      expect(eq).toHaveBeenCalledWith('appointment_id', 'appt-1');
      expect(result).toBe('completed');
    });

    it('returns not_started when no submission exists', async () => {
      const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
      const eq = jest.fn().mockReturnValue({ maybeSingle });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await getIntakeStatusForAppointment('appt-1');

      expect(result).toBe('not_started');
    });

    it('throws when fetch fails', async () => {
      const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      const eq = jest.fn().mockReturnValue({ maybeSingle });
      const select = jest.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      await expect(getIntakeStatusForAppointment('appt-1')).rejects.toThrow(
        'Fetch intake status failed: DB error'
      );
    });
  });
});

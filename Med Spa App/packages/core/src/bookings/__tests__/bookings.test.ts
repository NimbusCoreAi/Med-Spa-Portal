import { bookAppointment } from '../index';
import { findOrCreatePatient } from '../../patients';
import { createAppointment } from '../../scheduling/appointments';

jest.mock('../../patients');
jest.mock('../../scheduling/appointments');

describe('bookings module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('finds-or-creates patient and creates appointment', async () => {
    const mockPatient = { id: 'pat-1', clinic_id: 'c-1', first_name: 'Jane', last_name: 'Doe', email: 'jane@test.com', created_at: new Date() };
    const mockAppointment = {
      id: 'apt-1', clinic_id: 'c-1', patient_id: 'pat-1',
      provider_id: 'prov-1', status: 'scheduled',
      scheduled_time: new Date(), duration_minutes: 30,
      intake_completed: false, payment_completed: false,
      payment_status: 'pending', created_at: new Date(),
    };

    (findOrCreatePatient as jest.Mock).mockResolvedValue(mockPatient);
    (createAppointment as jest.Mock).mockResolvedValue(mockAppointment);

    const result = await bookAppointment({
      clinicId: 'c-1',
      providerId: 'prov-1',
      scheduledTime: '2024-01-15T10:00:00Z',
      durationMinutes: 30,
      patient: { firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com' },
    });

    expect(result.patient).toBe(mockPatient);
    expect(result.appointment).toBe(mockAppointment);
    expect(findOrCreatePatient).toHaveBeenCalledWith(
      expect.objectContaining({ clinicId: 'c-1', firstName: 'Jane' }),
      undefined
    );
    expect(createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ clinicId: 'c-1', patientId: 'pat-1', providerId: 'prov-1' }),
      undefined
    );
  });

  it('passes optional client to both functions', async () => {
    const mockClient = { from: jest.fn() } as any;
    (findOrCreatePatient as jest.Mock).mockResolvedValue({ id: 'p1', clinic_id: 'c1' });
    (createAppointment as jest.Mock).mockResolvedValue({ id: 'a1' });

    await bookAppointment({
      clinicId: 'c-1',
      scheduledTime: '2024-01-15T10:00:00Z',
      durationMinutes: 60,
      patient: { firstName: 'John', lastName: 'Smith' },
    }, mockClient);

    expect(findOrCreatePatient).toHaveBeenCalledWith(expect.any(Object), mockClient);
    expect(createAppointment).toHaveBeenCalledWith(expect.any(Object), mockClient);
  });
});

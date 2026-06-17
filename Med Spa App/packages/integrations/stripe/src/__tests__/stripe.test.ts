const mockCheckoutSessionsCreate = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    webhooks: { constructEvent: mockConstructEvent }
  }));
});

import { createPaymentLink, constructWebhookEvent } from '../index';

describe('stripe integration', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';
    jest.clearAllMocks();
  });

  describe('createPaymentLink', () => {
    it('creates a checkout session with the correct amount and metadata', async () => {
      mockCheckoutSessionsCreate.mockResolvedValue({ id: 'cs_test_1', url: 'https://stripe.com/c/pay/cs_test_1' });

      const result = await createPaymentLink({
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        appointmentId: 'appt-1',
        amount: 150,
        description: 'Botox Treatment'
      });

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: { name: 'Botox Treatment' },
                unit_amount: 15000
              },
              quantity: 1
            }
          ],
          metadata: { clinic_id: 'clinic-1', patient_id: 'patient-1', appointment_id: 'appt-1' }
        })
      );
      expect(result).toEqual({ id: 'cs_test_1', url: 'https://stripe.com/c/pay/cs_test_1' });
    });

    it('throws when STRIPE_SECRET_KEY is missing', async () => {
      delete process.env.STRIPE_SECRET_KEY;

      await expect(
        createPaymentLink({
          clinicId: 'clinic-1',
          patientId: 'patient-1',
          appointmentId: 'appt-1',
          amount: 150,
          description: 'Botox Treatment'
        })
      ).rejects.toThrow('Missing Stripe configuration: set STRIPE_SECRET_KEY');
    });
  });

  describe('constructWebhookEvent', () => {
    it('returns completed status for checkout.session.completed', () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { metadata: { appointment_id: 'appt-1' } } }
      });

      const result = constructWebhookEvent('body', 'sig');

      expect(result).toEqual({
        type: 'checkout.session.completed',
        appointmentId: 'appt-1',
        paymentStatus: 'completed'
      });
    });

    it('returns failed status for payment_intent.payment_failed', () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: { object: { metadata: { appointment_id: 'appt-1' } } }
      });

      const result = constructWebhookEvent('body', 'sig');

      expect(result).toEqual({
        type: 'payment_intent.payment_failed',
        appointmentId: 'appt-1',
        paymentStatus: 'failed'
      });
    });

    it('returns just the type for other event types', () => {
      mockConstructEvent.mockReturnValue({
        type: 'customer.created',
        data: { object: {} }
      });

      const result = constructWebhookEvent('body', 'sig');

      expect(result).toEqual({ type: 'customer.created' });
    });

    it('throws when STRIPE_WEBHOOK_SECRET is missing', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      expect(() => constructWebhookEvent('body', 'sig')).toThrow(
        'Missing Stripe configuration: set STRIPE_WEBHOOK_SECRET'
      );
    });
  });
});

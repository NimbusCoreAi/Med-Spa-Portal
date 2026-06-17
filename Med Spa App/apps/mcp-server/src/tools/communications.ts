import type { MCPTool } from '../types.js';
import { callConnectApi } from './shared.js';

export const sendSmsReminder: MCPTool = {
  name: 'send_sms_reminder',
  description: 'Send an SMS appointment reminder to a customer via the Connect API',
  inputSchema: {
    type: 'object',
    properties: {
      patient_phone: { type: 'string', description: 'Customer phone number' },
      patient_name: { type: 'string', description: 'Customer name' },
      appointment_time: { type: 'string', description: 'ISO datetime' },
      clinic_name: { type: 'string', description: 'Clinic/business name' },
      template: { type: 'string', enum: ['pre-appointment', 'intake-reminder'], description: 'SMS template' },
    },
    required: ['patient_phone', 'patient_name', 'appointment_time', 'clinic_name'],
  },
  handler: async (args, apiKey) => callConnectApi(apiKey, 'POST', '/api/v1/communications/sms-reminder', args),
};

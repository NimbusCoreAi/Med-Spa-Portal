import type { MCPTool } from '../types.js';
import { callConnectApi } from './shared.js';

export const deductPackage: MCPTool = {
  name: 'deduct_package',
  description: 'Deduct a session from a credit package via the Connect API',
  inputSchema: {
    type: 'object',
    properties: {
      package_id: { type: 'string', format: 'uuid' },
      patient_id: { type: 'string', format: 'uuid' },
      clinic_id: { type: 'string', format: 'uuid' },
    },
    required: ['package_id', 'patient_id', 'clinic_id'],
  },
  handler: async (args, apiKey) => callConnectApi(apiKey, 'POST', '/api/v1/billing/package-deduct', args),
};

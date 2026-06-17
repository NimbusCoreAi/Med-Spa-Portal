import type { MCPTool } from '../types.js';
import { callConnectApi } from './shared.js';

export const getTreatmentMetrics: MCPTool = {
  name: 'get_treatment_metrics',
  description: 'Retrieve treatment/service metrics from the Connect API',
  inputSchema: {
    type: 'object',
    properties: {
      clinic_id: { type: 'string', format: 'uuid' },
      from: { type: 'string', description: 'ISO datetime (optional)' },
      to: { type: 'string', description: 'ISO datetime (optional)' },
      group_by: { type: 'string', enum: ['provider', 'service_type', 'month'] },
    },
    required: ['clinic_id'],
  },
  handler: async (args, apiKey) => callConnectApi(apiKey, 'POST', '/api/v1/reporting/treatment-metrics', args),
};

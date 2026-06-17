import type { MCPTool } from '../types.js';
import { callConnectApi } from './shared.js';

export const getRiskScore: MCPTool = {
  name: 'get_risk_score',
  description: 'Get intelligence risk score for a customer or tenant',
  inputSchema: {
    type: 'object',
    properties: {
      tenant_id: { type: 'string', format: 'uuid' },
      customer_id: { type: 'string', format: 'uuid', description: 'Optional — omit for tenant-level analysis' },
    },
    required: ['tenant_id'],
  },
  handler: async (args, apiKey) => callConnectApi(apiKey, 'POST', '/api/v1/intelligence/risk-score', args),
};

export const getChurnPrediction: MCPTool = {
  name: 'get_churn_prediction',
  description: 'Get ML-based churn prediction for a customer',
  inputSchema: {
    type: 'object',
    properties: {
      tenant_id: { type: 'string', format: 'uuid' },
      customer_id: { type: 'string', format: 'uuid' },
    },
    required: ['tenant_id'],
  },
  handler: async (args, apiKey) => callConnectApi(apiKey, 'POST', '/api/v1/intelligence/churn-prediction', args),
};

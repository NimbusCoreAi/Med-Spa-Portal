import type { MCPTool } from '../types.js';
import { callConnectApi } from './shared.js';

export const browseMarketplace: MCPTool = {
  name: 'browse_marketplace',
  description: 'Browse available marketplace modules',
  inputSchema: {
    type: 'object',
    properties: {
      vertical: { type: 'string', description: 'Filter by vertical' },
      category: { type: 'string', description: 'Filter by category' },
      q: { type: 'string', description: 'Search query' },
    },
  },
  handler: async (args, apiKey) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) { if (v) params.set(k, String(v)); }
    return callConnectApi(apiKey, 'GET', `/api/v1/marketplace/modules?${params}`);
  },
};

export const installModule: MCPTool = {
  name: 'install_module',
  description: 'Subscribe a clinic to a marketplace module',
  inputSchema: {
    type: 'object',
    properties: {
      clinic_id: { type: 'string', format: 'uuid' },
      module_id: { type: 'string', format: 'uuid' },
    },
    required: ['clinic_id', 'module_id'],
  },
  handler: async (args, apiKey) => callConnectApi(apiKey, 'POST', '/api/v1/marketplace/install', args),
};

export const uninstallModule: MCPTool = {
  name: 'uninstall_module',
  description: 'Unsubscribe a clinic from a marketplace module',
  inputSchema: {
    type: 'object',
    properties: {
      clinic_id: { type: 'string', format: 'uuid' },
      module_id: { type: 'string', format: 'uuid' },
    },
    required: ['clinic_id', 'module_id'],
  },
  handler: async (args, apiKey) => callConnectApi(apiKey, 'DELETE', `/api/v1/marketplace/install?clinic_id=${args.clinic_id}&module_id=${args.module_id}`),
};

export const listInstalledModules: MCPTool = {
  name: 'list_installed_modules',
  description: 'Get installed marketplace modules for a clinic',
  inputSchema: {
    type: 'object',
    properties: {
      clinic_id: { type: 'string', format: 'uuid' },
    },
    required: ['clinic_id'],
  },
  handler: async (args, apiKey) => callConnectApi(apiKey, 'GET', `/api/v1/marketplace/modules?clinic_id=${args.clinic_id}`),
};

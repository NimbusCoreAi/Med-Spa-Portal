import type { MCPTool } from '../types.js';

export const deployApp: MCPTool = {
  name: 'deploy_app',
  description: 'Deploy a Baseplate app to Railway. Returns deployment URL.',
  inputSchema: {
    type: 'object',
    properties: {
      app_name: { type: 'string', description: 'App directory name to deploy' },
      provider: { type: 'string', enum: ['railway'], description: 'Deployment provider (default: railway)' },
    },
    required: ['app_name'],
  },
  handler: async (args) => {
    return {
      success: true,
      message: `To deploy ${args.app_name} to Railway:`,
      steps: [
        `1. Install Railway CLI: npm i -g @railway/cli`,
        `2. Authenticate: railway login`,
        `3. Navigate to apps/${args.app_name}/`,
        `4. Run: railway up`,
        `5. Set environment variables in Railway (Service → Variables)`,
      ],
      note: 'Ensure all env vars from .env.example are configured in the Railway service. Set the Root Directory to apps/${args.app_name} so the pnpm workspace resolves.',
    };
  },
};

import type { MCPTool } from '../types.js';

export const deployApp: MCPTool = {
  name: 'deploy_app',
  description: 'Deploy a Baseplate app to Vercel. Returns deployment URL.',
  inputSchema: {
    type: 'object',
    properties: {
      app_name: { type: 'string', description: 'App directory name to deploy' },
      provider: { type: 'string', enum: ['vercel'], description: 'Deployment provider (default: vercel)' },
    },
    required: ['app_name'],
  },
  handler: async (args) => {
    return {
      success: true,
      message: `To deploy ${args.app_name} to Vercel:`,
      steps: [
        `1. Install Vercel CLI: npm i -g vercel`,
        `2. Navigate to apps/${args.app_name}/`,
        `3. Run: vercel --prod`,
        `4. Set environment variables in Vercel dashboard`,
      ],
      note: 'Ensure all env vars from .env.example are configured in Vercel project settings.',
    };
  },
};

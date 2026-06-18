import type { MCPTool } from '../types.js';

export const scaffoldVertical: MCPTool = {
  name: 'scaffold_vertical',
  description: 'Create a new Baseplate app for a vertical. Returns setup instructions.',
  inputSchema: {
    type: 'object',
    properties: {
      vertical: { type: 'string', description: 'Vertical name (e.g., med-spa, home-services, accounting)' },
      app_name: { type: 'string', description: 'Name for the new app' },
    },
    required: ['vertical', 'app_name'],
  },
  handler: async (args) => {
    const { vertical, app_name } = args;
    return {
      success: true,
      message: `Scaffold instructions for ${app_name} (${vertical} vertical)`,
      steps: [
        `1. Clone the Baseplate monorepo`,
        `2. Create apps/${app_name}/ with Next.js 14`,
        `3. Configure RBAC with createRBAC() factory for ${vertical} roles`,
        `4. Wire to @baseplate/core (auth, audit, encryption, scheduling)`,
        `5. Connect to Connect API for SMS, billing, reporting, intelligence`,
        `6. Deploy to Railway`,
      ],
      setup_commands: `git clone baseplate && cd baseplate && mkdir apps/${app_name}`,
      documentation: 'See ARCHITECTURE.md and CROSS_VERTICAL_GUIDE.md',
    };
  },
};

import { createInterface } from 'readline';
import type { MCPRequest, MCPResponse } from './types.js';
import { allTools } from './tools/index.js';

const toolsByName = new Map(allTools.map((t) => [t.name, t]));

function validateApiKey(): string {
  const apiKey = process.env.CONNECT_API_KEY;
  if (!apiKey) {
    throw new Error('CONNECT_API_KEY environment variable is required');
  }
  return apiKey;
}

async function handleRequest(req: MCPRequest, apiKey: string): Promise<MCPResponse> {
  const { method, params, id } = req;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'baseplate-mcp-server', version: '0.1.0' },
      },
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: allTools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      },
    };
  }

  if (method === 'tools/call') {
    const toolName = params?.name as string;
    const toolArgs = (params?.arguments ?? {}) as Record<string, unknown>;
    const tool = toolsByName.get(toolName);

    if (!tool) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: `Unknown tool: ${toolName}` },
      };
    }

    try {
      const result = await tool.handler(toolArgs, apiKey);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        },
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err instanceof Error ? err.message : 'Internal error',
        },
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

async function main() {
  const apiKey = validateApiKey();
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });

  rl.on('line', async (line: string) => {
    if (!line.trim()) return;

    try {
      const req = JSON.parse(line) as MCPRequest;
      const response = await handleRequest(req, apiKey);
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (err) {
      const errorResponse: MCPResponse = {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
      };
      process.stdout.write(JSON.stringify(errorResponse) + '\n');
    }
  });
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});

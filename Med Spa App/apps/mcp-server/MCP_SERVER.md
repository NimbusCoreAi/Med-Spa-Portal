# Baseplate MCP Server

Exposes Baseplate Connect API operations to AI agents via the Model Context Protocol (MCP).

## Quick Start

### Claude Desktop

1. Copy `claude-desktop-config.json` into your Claude Desktop config directory:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Set your `CONNECT_API_KEY` in the config.

3. Restart Claude Desktop.

### Standalone

```bash
cd Med Spa App
CONNECT_API_URL=http://localhost:3001 CONNECT_API_KEY=your-key npx tsx apps/mcp-server/src/index.ts
```

## Available Tools (11)

| Tool | Description |
|------|-------------|
| `send_sms_reminder` | Send SMS appointment reminder via Connect API |
| `deduct_package` | Deduct a session from a credit package |
| `get_treatment_metrics` | Retrieve treatment/service metrics |
| `get_risk_score` | Get intelligence risk score for a customer |
| `get_churn_prediction` | Get ML-based churn prediction |
| `browse_marketplace` | Browse available marketplace modules |
| `install_module` | Subscribe clinic to a marketplace module |
| `uninstall_module` | Unsubscribe from a marketplace module |
| `list_installed_modules` | Get installed modules for a clinic |
| `scaffold_vertical` | Get setup instructions for a new Baseplate vertical app |
| `deploy_app` | Get deployment instructions for a Baseplate app |

## Protocol

Implements MCP JSON-RPC 2.0 over stdio. Supports:
- `initialize` — capability handshake
- `tools/list` — enumerate available tools (returns all 11 tools)
- `tools/call` — invoke a tool with arguments

## Authentication

All API-backed tools require `CONNECT_API_KEY` environment variable. The API key is sent as the `X-API-Key` header to the Connect API.

## Example Interaction

```
User: "Build me a med spa portal"
Claude: I'll use the Baseplate MCP server to scaffold this.

  > tools/call: scaffold_vertical
    args: { "vertical": "med-spa", "app_name": "my-clinic" }

  Result: Scaffold instructions for my-clinic (med-spa vertical)
  1. Clone the Baseplate monorepo
  2. Create apps/my-clinic/ with Next.js 14
  3. Configure RBAC with createRBAC() factory for med-spa roles
  ...

User: "What's the risk score for patient X?"
Claude:
  > tools/call: get_risk_score
    args: { "tenant_id": "clinic-uuid", "customer_id": "patient-uuid" }

  Result: { "overall_risk": "high", "flags": [...] }
```

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `CONNECT_API_KEY` | Yes | API key for the Connect API |
| `CONNECT_API_URL` | No | Connect API base URL (default: `http://localhost:3001`) |

# Contributing to Baseplate

Thank you for your interest in contributing to Baseplate! This guide covers everything you need to get started.

## Quick Setup

```bash
git clone <repo-url>
cd baseplate
pnpm install
pnpm dev    # portal on :3000, connect-api on :3001, home-services on :3002
```

### Prerequisites

- Node.js 20+
- pnpm 8+
- A Supabase project (free tier works)

### Environment

```bash
cp .env.example .env.local
# Fill in Supabase, Stripe, Postmark, Twilio keys
```

## Project Structure

```
apps/           # Next.js applications (portal-medspa, portal-homeservices, connect-api, mcp-server)
packages/       # Reusable modules (@baseplate/core, @baseplate/intelligence, etc.)
supabase/       # SQL migrations
docs/           # Documentation
ml-models/      # Python ML training pipeline
```

**Rule:** Reusable code goes in `packages/`. Vertical-specific code goes in `apps/portal-[vertical]/`.

Ask: "Would another vertical use this?" If yes → `packages/`. If no → `apps/`.

## Coding Standards

### TypeScript
- Strict mode everywhere (`"strict": true`)
- Use `import type` for type-only imports
- No `any` — use `unknown` or proper types
- Export types alongside implementations

### React / Next.js
- Server components by default; `'use client'` only when needed
- Extract reusable UI into `@baseplate/ui`
- Extract complex workflows into `@baseplate/patterns`

### Database
- Every table needs RLS policies
- Use migrations (`supabase/migrations/`) — never edit schema directly
- Migration naming: `NNNN_description.sql` (e.g., `0014_add_column.sql`)

### Testing
- Every new module needs tests
- Coverage threshold: 80%+ for `packages/ui` and `packages/patterns`
- Test files go in `__tests__/` directories alongside source

## Pull Request Process

1. **Create a branch:** `feat/your-feature` or `fix/your-bugfix`
2. **Write tests** for your changes
3. **Run the gates:**
   ```bash
   pnpm typecheck    # Must pass
   pnpm test         # Must pass
   pnpm build        # Must pass
   ```
4. **Open a PR** with a clear description of what changed and why
5. **Link issues** in the PR description

### PR Template

```
## Summary
[What does this PR change?]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] New module/package
- [ ] Documentation
- [ ] Refactor

## Test Plan
[How did you verify this works?]

## Breaking Changes
- [ ] None
- [ ] Yes (describe migration path)
```

## Creating a New Package

```bash
mkdir packages/your-package
cd packages/your-package

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@baseplate/your-package",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
EOF

# Create jest.config.js
cat > jest.config.js << 'EOF'
module.exports = { preset: 'ts-jest', testEnvironment: 'node' };
EOF

# Register in root package.json workspaces (if not auto-detected)
pnpm install
```

## Reporting Bugs

Use the GitHub issue tracker. Include:
- What you expected
- What actually happened
- Steps to reproduce
- Environment (OS, Node version, browser)

## Suggesting Features

Open a GitHub discussion or feature request issue. Describe:
- The problem you're trying to solve
- Your proposed solution
- Which vertical(s) this applies to

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

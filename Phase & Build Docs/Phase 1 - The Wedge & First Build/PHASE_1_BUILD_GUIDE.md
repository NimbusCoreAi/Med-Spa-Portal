> **⚠️ STATUS NOTE:** This doc is stale. For current project status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md)
>
> **🔧 MAINTENANCE:** After completing any sub-phase described in this document, update [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md): (1) update the "At a Glance" table, (2) check off completed items, (3) add the commit hash to the "Build Log" table. This is mandatory after every sub-phase completion or significant commit.

# Phase 1: Med Spa Portal - AI-Ready Build Guide
## Extremely Detailed, Granular Build Instructions with Skill Assignments

**Phase Duration:** Phase 1 (Phases 1A-1D)  
**Purpose:** Build HIPAA-compliant med spa portal + extract 16 reusable modules for Phase 2  
**Audience:** AI agents executing builds (requires extreme clarity)  
**Document Split:** 4 sub-phases to preserve context window

---

> **Status:** See `../../MASTER_PROGRESS.md` for current status.

---

## 🔧 NOTE FOR AI AGENTS: Skill Availability

Every task below has a **"Skill to Use" / "Skills to Use"** annotation referencing skills from the `agentsystem-core` plugin (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/`) — e.g. `add-feature`, `write-tests`, `harden-types`, `add-migration`, `testing-plan`, `frontend-design`, `verification-before-completion`, `commit`.

**These skills ARE installed and available in this environment.** Each phase section below also has a "Skills for this phase" quick-reference line listing exactly which ones it needs.

**How to find and invoke a skill:**
1. At the start of a session, Claude Code lists all currently available skills in a system-reminder (names match exactly, no `agentsystem-core:` prefix needed unless there's a naming collision).
2. Invoke a skill with the `Skill` tool, passing the skill name from the annotation (e.g. `skill: "add-feature"`). In the interactive CLI, the equivalent is typing `/add-feature`.
3. If a skill referenced in this guide is missing from the available-skills list (e.g. the plugin was uninstalled or renamed), use this fallback mapping to the `superpowers` plugin (`Skills/General Skills/`):

| If missing: agentsystem-core skill | Fallback (superpowers) |
|---|---|
| `verification-before-completion` | `verification-before-completion` — same name |
| `write-tests`, `testing-plan`, `add-regression-test` | `test-driven-development` |
| `add-feature`, `harden-types`, `add-migration`, `frontend-design` | No direct equivalent — follow this guide's detailed steps directly. Optionally use `writing-plans`/`executing-plans` for multi-step scaffolding and `systematic-debugging` if something breaks. |

---

## ⚠️ CRITICAL: Module Library Mandate

**Everything you build MUST be categorized:**
- **`apps/portal-medspa/`** — Med spa specific code
- **`packages/`** — Reusable infrastructure modules

See `MODULES_LIBRARY.md` and `DEVELOPER_CHECKLIST.md` before starting.

---

# PHASE 1A: Foundation Setup (Week 1-2)
## Project Initialization + Core Module Structure

**Duration:** 2 weeks  
**AI Agent Type:** Multi-step implementation with sub-agents  
**Goal:** Initialize monorepo, set up database, create core module structure

**Skills for this phase:** `add-feature`, `add-migration`, `harden-types`, `verification-before-completion`, `commit`. See "NOTE FOR AI AGENTS: Skill Availability" above for how to invoke these and the fallback mapping.

---

## Task 1A.1: Initialize Monorepo Structure

**Skill to Use:** `/skill add-feature` (for initializing project scaffolding)

**What to Build:**
```
Med Spa App/
├── apps/
│   ├── portal-medspa/          # Med spa portal React app
│   └── connect-api/             # (empty for Phase 2)
├── packages/
│   ├── core/                    # Foundation modules (auth, rbac, audit-logs)
│   ├── integrations/            # Integration modules (stripe, postmark, twilio)
│   ├── ui/                      # Reusable components
│   └── patterns/                # Workflow patterns
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── .gitignore
```

**Detailed Steps:**

1. Initialize Git repo (if not existing):
   - `git init`
   - `git branch -M main`

2. Create monorepo root files:
   - **`pnpm-workspace.yaml`:**
     ```yaml
     packages:
       - 'apps/*'
       - 'packages/*'
     ```
   - **`turbo.json`:**
     ```json
     {
       "version": "1",
       "tasks": {
         "build": {
           "outputs": ["dist/**"],
           "cache": false
         },
         "test": {
           "outputs": ["coverage/**"],
           "cache": false
         }
       }
     }
     ```
   - **`package.json`:** (root monorepo config)
     ```json
     {
       "name": "baseplate",
       "version": "0.1.0",
       "private": true,
       "packageManager": "pnpm@8.0.0",
       "workspaces": ["apps/*", "packages/*"],
       "devDependencies": {
         "turbo": "^1.10.0",
         "typescript": "^5.0.0"
       },
       "scripts": {
         "build": "turbo run build",
         "test": "turbo run test",
         "dev": "turbo run dev"
       }
     }
     ```

3. Create directory structure:
   - Create `apps/portal-medspa/` (empty for now)
   - Create `apps/connect-api/` (empty for now)
   - Create `packages/core/` 
   - Create `packages/integrations/`
   - Create `packages/ui/`
   - Create `packages/patterns/`

4. Add `.gitignore`:
   ```
   node_modules/
   dist/
   .turbo/
   .env.local
   .DS_Store
   *.log
   pnpm-lock.yaml
   ```

5. Commit:
   - Skill: `/skill commit`
   - Message: "Initialize monorepo structure for Baseplate"

---

## Task 1A.2: Set Up Supabase Database

**Skill to Use:** `/skill add-migration` (for schema initialization)

**What to Build:**
- Supabase project (cloud-hosted or local)
- Core database tables (Clinics, Staff, Patients, Intakes, Audit Logs)
- Row-level security (RLS) policies

**Detailed Steps:**

1. Create Supabase project or connect to local Supabase

2. Create database schema (migrations):
   ```sql
   -- Migration: 0001_init_clinics.sql
   CREATE TABLE clinics (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     location VARCHAR(255),
     phone VARCHAR(20),
     num_providers INT,
     created_at TIMESTAMP DEFAULT NOW(),
     owner_id UUID REFERENCES auth.users(id)
   );
   
   CREATE TABLE staff (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     clinic_id UUID REFERENCES clinics(id),
     email VARCHAR(255) UNIQUE NOT NULL,
     name VARCHAR(255),
     role VARCHAR(50), -- 'owner', 'staff'
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE TABLE patients (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     clinic_id UUID REFERENCES clinics(id),
     email VARCHAR(255),
     phone VARCHAR(20),
     first_name VARCHAR(255),
     last_name VARCHAR(255),
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     clinic_id UUID REFERENCES clinics(id),
     user_id UUID REFERENCES auth.users(id),
     action VARCHAR(100),
     resource_type VARCHAR(50),
     resource_id UUID,
     timestamp TIMESTAMP DEFAULT NOW(),
     ip_address VARCHAR(50),
     user_agent TEXT
   );
   ```

3. Enable RLS on all tables:
   ```sql
   ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
   ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
   ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
   ```

4. Create RLS policies (example for clinics):
   ```sql
   -- Clinic owner can see all data for their clinic
   CREATE POLICY clinic_owner_policy ON clinics
   FOR SELECT USING (owner_id = auth.uid());
   ```

5. Set up Supabase Auth:
   - Enable Email/Password provider
   - Configure email templates (optional)

---

## Task 1A.3: Create Core Module Scaffolding

**Skill to Use:** `/skill add-feature` (for module scaffolding)

**What to Build:**
Core module structure in `packages/core/`:

```
packages/core/
├── src/
│   ├── auth/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── __tests__/
│   ├── rbac/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── __tests__/
│   ├── audit-logs/
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── encryption/
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── types/
│   │   └── index.ts
│   ├── config/
│   │   └── index.ts
│   └── index.ts (export all)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

**Detailed Steps:**

1. Create `packages/core/package.json`:
   ```json
   {
     "name": "@baseplate/core",
     "version": "0.1.0",
     "main": "src/index.ts",
     "devDependencies": {
       "typescript": "^5.0.0",
       "jest": "^29.0.0"
     },
     "dependencies": {
       "@supabase/supabase-js": "^2.38.0",
       "tweetnacl": "^1.0.3"
     }
   }
   ```

2. Create `packages/core/tsconfig.json`:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "dist",
       "declaration": true
     },
     "include": ["src"],
     "exclude": ["**/__tests__"]
   }
   ```

3. Create subdirectories with placeholder files:
   - `src/auth/index.ts` — Will contain Auth module
   - `src/rbac/index.ts` — Will contain RBAC module
   - `src/audit-logs/index.ts` — Will contain Audit Logs module
   - `src/encryption/index.ts` — Will contain Encryption module
   - `src/types/index.ts` — Shared types
   - `src/config/index.ts` — Configuration

4. Create `packages/core/README.md`:
   ```markdown
   # @baseplate/core
   
   Reusable foundation modules for Baseplate infrastructure.
   
   ## Modules
   - **auth**: Authentication + session management
   - **rbac**: Role-based access control
   - **audit-logs**: Compliance audit logging
   - **encryption**: Data encryption utilities
   - **types**: Shared TypeScript types
   - **config**: Environment configuration
   
   All modules are vertical-agnostic and reusable across med spas, contractors, home services, etc.
   ```

5. Create `packages/core/src/index.ts`:
   ```typescript
   export * from './auth';
   export * from './rbac';
   export * from './audit-logs';
   export * from './encryption';
   export * from './types';
   export * from './config';
   ```

---

## Task 1A.4: Create Shared Types

**Skill to Use:** `/skill harden-types` (for TypeScript type safety)

**What to Build:**
Shared types in `packages/core/src/types/index.ts`

**Detailed Steps:**

1. Create `packages/core/src/types/index.ts`:
   ```typescript
   export interface Clinic {
     id: string;
     name: string;
     location?: string;
     phone?: string;
     num_providers?: number;
     created_at: Date;
     owner_id: string;
   }
   
   export interface Staff {
     id: string;
     clinic_id: string;
     email: string;
     name: string;
     role: 'owner' | 'staff';
     created_at: Date;
   }
   
   export interface Patient {
     id: string;
     clinic_id: string;
     email?: string;
     phone?: string;
     first_name: string;
     last_name: string;
     created_at: Date;
   }
   
   export interface AuditLog {
     id: string;
     clinic_id: string;
     user_id: string;
     action: string;
     resource_type: string;
     resource_id: string;
     timestamp: Date;
     ip_address?: string;
     user_agent?: string;
   }
   
   export type Role = 'owner' | 'staff' | 'patient';
   
   export interface UserContext {
     userId: string;
     clinicId: string;
     role: Role;
     email: string;
   }
   ```

2. Commit types:
   - Skill: `/skill commit`
   - Message: "Add shared types for core modules"

---

## Task 1A.5: Verify Setup Complete

**Skill to Use:** `/skill verification-before-completion` (to validate setup)

**What to Verify:**
- [ ] Monorepo structure created
- [ ] All directories exist
- [ ] package.json files in place
- [ ] Supabase project configured
- [ ] Database schema created
- [ ] All files committed to git
- [ ] No TypeScript compilation errors

**Detailed Steps:**

1. Verify directory structure:
   ```bash
   ls -la apps/portal-medspa/
   ls -la packages/core/
   ```

2. Verify Supabase connection works:
   - Test API connection
   - Verify tables created
   - Check RLS policies applied

3. Run TypeScript compiler:
   ```bash
   pnpm tsc --noEmit
   ```

4. Verify git state:
   ```bash
   git status
   git log --oneline
   ```

---

## Phase 1A Summary

**Deliverables:**
- ✅ Monorepo initialized with proper structure
- ✅ Supabase database configured with RLS
- ✅ Core module directories created
- ✅ Shared types defined
- ✅ All changes committed

**What's Ready for Phase 1B:**
- Empty module structure ready for auth implementation
- Database ready for data
- TypeScript configured and compiling

---

---

# PHASE 1B: Auth + RBAC (Week 2-3)
## Build Authentication Module + Role-Based Access Control

**Duration:** 2 weeks  
**AI Agent Type:** Feature implementation with testing  
**Goal:** Implement auth module + RBAC + password resets

**Skills for this phase:** `add-feature`, `write-tests`, `harden-types`, `testing-plan`, `verification-before-completion`, `commit`. See "NOTE FOR AI AGENTS: Skill Availability" near the top of this file for how to invoke these and the fallback mapping.

---

## Task 1B.1: Implement Auth Module

**Skills to Use:**
1. `/skill add-feature` (for auth feature)
2. `/skill write-tests` (for auth tests)
3. `/skill harden-types` (for type safety)

**What to Build:**
Authentication wrapper in `packages/core/src/auth/index.ts`

**Detailed Steps:**

1. Create `packages/core/src/auth/index.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   interface LoginParams {
     email: string;
     password: string;
   }
   
   interface SignUpParams {
     email: string;
     password: string;
     clinic_name: string;
     clinic_location?: string;
   }
   
   export async function login(params: LoginParams) {
     const supabase = createClient(
       process.env.SUPABASE_URL!,
       process.env.SUPABASE_ANON_KEY!
     );
     
     const { data, error } = await supabase.auth.signInWithPassword({
       email: params.email,
       password: params.password
     });
     
     if (error) throw new Error(`Login failed: ${error.message}`);
     return data;
   }
   
   export async function signUp(params: SignUpParams) {
     const supabase = createClient(
       process.env.SUPABASE_URL!,
       process.env.SUPABASE_ANON_KEY!
     );
     
     // Create auth user
     const { data: authData, error: authError } = await supabase.auth.signUp({
       email: params.email,
       password: params.password
     });
     
     if (authError) throw new Error(`Signup failed: ${authError.message}`);
     
     // Create clinic
     const { data: clinicData, error: clinicError } = await supabase
       .from('clinics')
       .insert({
         owner_id: authData.user.id,
         name: params.clinic_name,
         location: params.clinic_location
       });
     
     if (clinicError) throw new Error(`Clinic creation failed: ${clinicError.message}`);
     
     return { user: authData.user, clinic: clinicData };
   }
   
   export async function logout() {
     const supabase = createClient(
       process.env.SUPABASE_URL!,
       process.env.SUPABASE_ANON_KEY!
     );
     
     await supabase.auth.signOut();
   }
   ```

2. Create `packages/core/src/auth/__tests__/auth.test.ts`:
   ```typescript
   import { login, signUp, logout } from '../index';
   
   describe('auth module', () => {
     it('should login with valid credentials', async () => {
       // Test login
     });
     
     it('should signup and create clinic', async () => {
       // Test signup
     });
     
     it('should logout', async () => {
       // Test logout
     });
   });
   ```

---

## Task 1B.2: Implement RBAC Module

**Skills to Use:**
1. `/skill add-feature` (for RBAC feature)
2. `/skill write-tests` (for RBAC tests)

**What to Build:**
RBAC checker in `packages/core/src/rbac/index.ts`

**Detailed Steps:**

1. Create `packages/core/src/rbac/types.ts`:
   ```typescript
   export type Role = 'owner' | 'staff' | 'patient';
   
   export interface Permission {
     canViewAllPatients: boolean;
     canViewAllAppointments: boolean;
     canViewAllPayments: boolean;
     canViewAuditLogs: boolean;
     canCreateStaff: boolean;
     canDeleteStaff: boolean;
     canCreateAppointment: boolean;
     canViewOwnData: boolean;
   }
   ```

2. Create `packages/core/src/rbac/index.ts`:
   ```typescript
   import { Role, Permission } from './types';
   
   export function getPermissions(role: Role): Permission {
     const permissions: Record<Role, Permission> = {
       owner: {
         canViewAllPatients: true,
         canViewAllAppointments: true,
         canViewAllPayments: true,
         canViewAuditLogs: true,
         canCreateStaff: true,
         canDeleteStaff: true,
         canCreateAppointment: true,
         canViewOwnData: true
       },
       staff: {
         canViewAllPatients: true,
         canViewAllAppointments: true,
         canViewAllPayments: true,
         canViewAuditLogs: false,
         canCreateStaff: false,
         canDeleteStaff: false,
         canCreateAppointment: true,
         canViewOwnData: true
       },
       patient: {
         canViewAllPatients: false,
         canViewAllAppointments: false,
         canViewAllPayments: false,
         canViewAuditLogs: false,
         canCreateStaff: false,
         canDeleteStaff: false,
         canCreateAppointment: false,
         canViewOwnData: true
       }
     };
     
     return permissions[role];
   }
   
   export function canPerform(role: Role, action: keyof Permission): boolean {
     const permissions = getPermissions(role);
     return permissions[action] === true;
   }
   ```

3. Create tests in `packages/core/src/rbac/__tests__/rbac.test.ts`:
   ```typescript
   import { getPermissions, canPerform } from '../index';
   
   describe('rbac module', () => {
     it('should grant owner all permissions', () => {
       const perms = getPermissions('owner');
       expect(perms.canViewAllPatients).toBe(true);
     });
     
     it('should restrict staff from audit logs', () => {
       expect(canPerform('staff', 'canViewAuditLogs')).toBe(false);
     });
   });
   ```

---

## Task 1B.3: Implement Audit Logs Module

**Skills to Use:**
1. `/skill add-feature` (for audit logs feature)
2. `/skill write-tests` (for audit logs tests)

**What to Build:**
Audit logging in `packages/core/src/audit-logs/index.ts`

**Detailed Steps:**

1. Create `packages/core/src/audit-logs/index.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   export interface LogActionParams {
     clinicId: string;
     userId: string;
     action: string;
     resourceType: string;
     resourceId: string;
     ipAddress?: string;
     userAgent?: string;
   }
   
   export async function logAction(params: LogActionParams) {
     const supabase = createClient(
       process.env.SUPABASE_URL!,
       process.env.SUPABASE_ANON_KEY!
     );
     
     const { error } = await supabase
       .from('audit_logs')
       .insert({
         clinic_id: params.clinicId,
         user_id: params.userId,
         action: params.action,
         resource_type: params.resourceType,
         resource_id: params.resourceId,
         ip_address: params.ipAddress,
         user_agent: params.userAgent,
         timestamp: new Date().toISOString()
       });
     
     if (error) throw new Error(`Audit log failed: ${error.message}`);
   }
   
   export async function getAuditLogs(clinicId: string) {
     const supabase = createClient(
       process.env.SUPABASE_URL!,
       process.env.SUPABASE_ANON_KEY!
     );
     
     const { data, error } = await supabase
       .from('audit_logs')
       .select('*')
       .eq('clinic_id', clinicId)
       .order('timestamp', { ascending: false });
     
     if (error) throw new Error(`Fetch audit logs failed: ${error.message}`);
     return data;
   }
   ```

2. Create tests in `packages/core/src/audit-logs/__tests__/audit-logs.test.ts`:
   ```typescript
   import { logAction, getAuditLogs } from '../index';
   
   describe('audit-logs module', () => {
     it('should log actions to database', async () => {
       // Test logging
     });
     
     it('should retrieve audit logs', async () => {
       // Test retrieval
     });
   });
   ```

---

## Task 1B.4: Implement Encryption Module

**Skills to Use:**
1. `/skill add-feature` (for encryption feature)
2. `/skill harden-types` (for type safety)

**What to Build:**
Encryption utilities in `packages/core/src/encryption/index.ts`

**Detailed Steps:**

1. Install tweetnacl:
   ```bash
   pnpm add tweetnacl
   ```

2. Create `packages/core/src/encryption/index.ts`:
   ```typescript
   import nacl from 'tweetnacl';
   import { randomBytes } from 'crypto';
   
   export function encryptData(plaintext: string, key: string): string {
     const keyBuffer = Buffer.from(key, 'hex');
     const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
     const encrypted = nacl.secretbox(
       Buffer.from(plaintext),
       nonce,
       keyBuffer as any
     );
     
     const encryptedData = Buffer.concat([nonce, Buffer.from(encrypted)]);
     return encryptedData.toString('hex');
   }
   
   export function decryptData(ciphertext: string, key: string): string {
     const keyBuffer = Buffer.from(key, 'hex');
     const encryptedData = Buffer.from(ciphertext, 'hex');
     const nonce = encryptedData.slice(0, nacl.secretbox.nonceLength);
     const encrypted = encryptedData.slice(nacl.secretbox.nonceLength);
     
     const decrypted = nacl.secretbox.open(encrypted as any, nonce, keyBuffer as any);
     if (!decrypted) throw new Error('Decryption failed');
     
     return Buffer.from(decrypted).toString('utf-8');
   }
   
   export function generateKey(): string {
     return randomBytes(32).toString('hex');
   }
   ```

---

## Task 1B.5: Create Core Module Index

**Skill to Use:** `/skill add-feature` (for module export)

**What to Build:**
Main export file in `packages/core/src/index.ts`

**Detailed Steps:**

1. Update `packages/core/src/index.ts`:
   ```typescript
   // Auth module
   export { login, signUp, logout } from './auth';
   export type { LoginParams, SignUpParams } from './auth';
   
   // RBAC module
   export { getPermissions, canPerform } from './rbac';
   export type { Role, Permission } from './rbac';
   
   // Audit Logs module
   export { logAction, getAuditLogs } from './audit-logs';
   export type { LogActionParams } from './audit-logs';
   
   // Encryption module
   export { encryptData, decryptData, generateKey } from './encryption';
   
   // Types module
   export type { Clinic, Staff, Patient, AuditLog, UserContext } from './types';
   ```

---

## Task 1B.6: Write Comprehensive Tests

**Skills to Use:**
1. `/skill write-tests` (for test implementation)
2. `/skill testing-plan` (for test planning)

**What to Build:**
Test suites for all auth/rbac/audit modules

**Test Checklist:**
- [ ] Auth: login, signup, logout, error handling
- [ ] RBAC: permissions by role, canPerform function
- [ ] Audit Logs: logging, retrieval, filtering
- [ ] Encryption: encrypt/decrypt, key generation

---

## Task 1B.7: Verify and Commit

**Skill to Use:** `/skill verification-before-completion`

**What to Verify:**
- [ ] All modules implemented
- [ ] Tests >80% coverage
- [ ] TypeScript compiles without errors
- [ ] No med spa specific code in packages/
- [ ] All exports documented
- [ ] Changes committed

---

## Phase 1B Summary

**Deliverables:**
- ✅ Auth module (login, signup, logout)
- ✅ RBAC module (permissions, role checking)
- ✅ Audit logs module (logging, retrieval)
- ✅ Encryption module (encrypt/decrypt)
- ✅ Comprehensive test suites
- ✅ All modules in `packages/core/`

**What's Ready for Phase 1C:**
- Core infrastructure ready
- Next: Portal frontend setup + intake forms

---

**To Continue:** Read PHASE_1_BUILD_GUIDE_PART2.md (Phase 1C & 1D)


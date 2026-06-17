import type { RuleContext } from '../../types';
import { noShowRiskRule } from '../rules/no-show-risk';
import { churnRiskRule } from '../rules/churn-risk';
import { revenueDropRule } from '../rules/revenue-drop';
import { packageAbandonmentRule } from '../rules/package-abandonment';
import { inventoryExpiryRule } from '../rules/inventory-expiry';
import { followUpGapRule } from '../rules/follow-up-gap';
import { evaluateRiskSync } from '../evaluate';
import { defaultRules } from '../rules';

const TENANT = 'clinic-1';
const PATIENT = 'patient-1';

function makeCtx(overrides: Partial<RuleContext> = {}): RuleContext {
  return {
    tenantId: TENANT,
    customerId: PATIENT,
    appointments: [],
    payments: [],
    packages: [],
    auditLogs: [],
    ...overrides,
  };
}

const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
const daysAhead = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

describe('no-show-risk rule', () => {
  it('triggers when 2+ no-shows in 90 days', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(20), intake_completed: false },
        { id: 'a2', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(50), intake_completed: false },
      ],
    });
    const flags = noShowRiskRule.evaluate(ctx);
    expect(flags).toHaveLength(1);
    expect(flags[0].type).toBe('no_show_risk');
    expect(flags[0].severity).toBe('high');
  });

  it('does not trigger when only 1 no-show', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(20), intake_completed: false },
      ],
    });
    expect(noShowRiskRule.evaluate(ctx)).toHaveLength(0);
  });

  it('ignores no-shows older than 90 days', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(100), intake_completed: false },
        { id: 'a2', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(95), intake_completed: false },
      ],
    });
    expect(noShowRiskRule.evaluate(ctx)).toHaveLength(0);
  });

  it('returns empty when no customerId', () => {
    const ctx = makeCtx({ customerId: undefined });
    expect(noShowRiskRule.evaluate(ctx)).toHaveLength(0);
  });
});

describe('churn-risk rule', () => {
  it('triggers when no appointment in 60+ days with frequent booking history', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(70) },
        { id: 'a2', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(98) },
        { id: 'a3', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(126) },
      ],
    });
    const flags = churnRiskRule.evaluate(ctx);
    expect(flags).toHaveLength(1);
    expect(flags[0].type).toBe('churn_risk');
    expect(flags[0].severity).toBe('medium');
  });

  it('does not trigger when appointment is recent', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(20) },
        { id: 'a2', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(48) },
      ],
    });
    expect(churnRiskRule.evaluate(ctx)).toHaveLength(0);
  });

  it('does not trigger with fewer than 2 appointments', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(90) },
      ],
    });
    expect(churnRiskRule.evaluate(ctx)).toHaveLength(0);
  });
});

describe('revenue-drop rule', () => {
  it('triggers when revenue drops >15%', () => {
    const ctx = makeCtx({
      tenantId: TENANT,
      customerId: undefined,
      payments: [
        // Prior period (3-6 months ago): high revenue
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `old-${i}`, amount: 300, created_at: daysAgo(100 + i * 5), status: 'completed',
        })),
        // Recent period (0-3 months ago): low revenue
        ...Array.from({ length: 2 }, (_, i) => ({
          id: `new-${i}`, amount: 100, created_at: daysAgo(10 + i * 5), status: 'completed',
        })),
      ],
    });
    const flags = revenueDropRule.evaluate(ctx);
    expect(flags).toHaveLength(1);
    expect(flags[0].type).toBe('revenue_drop');
    expect(flags[0].severity).toBe('low');
  });

  it('does not trigger when revenue is stable', () => {
    const ctx = makeCtx({
      tenantId: TENANT,
      customerId: undefined,
      payments: [
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `old-${i}`, amount: 200, created_at: daysAgo(100 + i * 5), status: 'completed',
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `new-${i}`, amount: 200, created_at: daysAgo(10 + i * 5), status: 'completed',
        })),
      ],
    });
    expect(revenueDropRule.evaluate(ctx)).toHaveLength(0);
  });

  it('does not trigger with insufficient data', () => {
    const ctx = makeCtx({
      payments: [{ id: 'p1', amount: 100, created_at: daysAgo(10), status: 'completed' }],
    });
    expect(revenueDropRule.evaluate(ctx)).toHaveLength(0);
  });
});

describe('package-abandonment rule', () => {
  it('triggers when package has remaining sessions with 90+ days inactivity', () => {
    const ctx = makeCtx({
      packages: [{
        id: 'pkg-1', patient_id: PATIENT, remaining_sessions: 4, total_sessions: 6,
        service_type: 'Botox', created_at: daysAgo(150),
      }],
      appointments: [],
    });
    const flags = packageAbandonmentRule.evaluate(ctx);
    expect(flags).toHaveLength(1);
    expect(flags[0].type).toBe('package_abandonment');
    expect(flags[0].severity).toBe('medium');
  });

  it('does not trigger when package was recently used', () => {
    const ctx = makeCtx({
      packages: [{
        id: 'pkg-1', patient_id: PATIENT, remaining_sessions: 4, total_sessions: 6,
        service_type: 'Botox', created_at: daysAgo(150),
      }],
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(30), service_type: 'Botox' },
      ],
    });
    expect(packageAbandonmentRule.evaluate(ctx)).toHaveLength(0);
  });

  it('does not trigger when package is fully used', () => {
    const ctx = makeCtx({
      packages: [{
        id: 'pkg-1', patient_id: PATIENT, remaining_sessions: 0, total_sessions: 6,
        created_at: daysAgo(150),
      }],
    });
    expect(packageAbandonmentRule.evaluate(ctx)).toHaveLength(0);
  });
});

describe('inventory-expiry rule', () => {
  it('triggers when inventory expires within 30 days', () => {
    const ctx = makeCtx({
      inventory: [
        { id: 'inv-1', name: 'Botox 100U', quantity: 5, expiry_date: daysAhead(15), clinic_id: TENANT },
        { id: 'inv-2', name: 'Filler 1ml', quantity: 3, expiry_date: daysAhead(25), clinic_id: TENANT },
      ],
    } as unknown as RuleContext);
    const flags = inventoryExpiryRule.evaluate(ctx);
    expect(flags).toHaveLength(1);
    expect(flags[0].type).toBe('inventory_expiry');
    expect(flags[0].severity).toBe('medium');
  });

  it('does not trigger when no inventory expiring soon', () => {
    const ctx = makeCtx({
      inventory: [
        { id: 'inv-1', name: 'Botox 100U', quantity: 5, expiry_date: daysAhead(90), clinic_id: TENANT },
      ],
    } as unknown as RuleContext);
    expect(inventoryExpiryRule.evaluate(ctx)).toHaveLength(0);
  });

  it('does not trigger when no inventory data', () => {
    expect(inventoryExpiryRule.evaluate(makeCtx())).toHaveLength(0);
  });
});

describe('follow-up-gap rule', () => {
  it('triggers when no follow-up 14+ days after completed appointment', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(20), service_type: 'Botox' },
      ],
    });
    const flags = followUpGapRule.evaluate(ctx);
    expect(flags).toHaveLength(1);
    expect(flags[0].type).toBe('follow_up_gap');
    expect(flags[0].severity).toBe('low');
  });

  it('does not trigger when follow-up is already scheduled', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(20), service_type: 'Botox' },
        { id: 'a2', patient_id: PATIENT, status: 'scheduled', scheduled_time: daysAhead(7), service_type: 'Botox' },
      ],
    });
    expect(followUpGapRule.evaluate(ctx)).toHaveLength(0);
  });

  it('does not trigger when last appointment was recent (<7 days)', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(5), service_type: 'Botox' },
      ],
    });
    expect(followUpGapRule.evaluate(ctx)).toHaveLength(0);
  });

  it('does not trigger when no completed appointments', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'scheduled', scheduled_time: daysAhead(7) },
      ],
    });
    expect(followUpGapRule.evaluate(ctx)).toHaveLength(0);
  });
});

describe('evaluateRiskSync (orchestrator)', () => {
  it('aggregates flags from all rules', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(20), intake_completed: false },
        { id: 'a2', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(50), intake_completed: false },
        { id: 'a3', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(20), service_type: 'Botox' },
      ],
      packages: [{
        id: 'pkg-1', patient_id: PATIENT, remaining_sessions: 4, total_sessions: 6,
        service_type: 'Botox', created_at: daysAgo(150),
      }],
    });

    const score = evaluateRiskSync(ctx);
    expect(score.tenantId).toBe(TENANT);
    expect(score.customerId).toBe(PATIENT);
    expect(score.flags.length).toBeGreaterThanOrEqual(1);
    expect(score.overallRisk).toBe('high');
    expect(score.recommendation).toBeTruthy();
    expect(score.evaluatedAt).toBeInstanceOf(Date);
  });

  it('returns low risk when no flags trigger', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'completed', scheduled_time: daysAgo(5), service_type: 'Botox' },
        { id: 'a2', patient_id: PATIENT, status: 'scheduled', scheduled_time: daysAhead(7), service_type: 'Botox' },
      ],
    });

    const score = evaluateRiskSync(ctx);
    expect(score.flags).toHaveLength(0);
    expect(score.overallRisk).toBe('low');
  });

  it('supports custom rule subsets', () => {
    const ctx = makeCtx({
      appointments: [
        { id: 'a1', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(20), intake_completed: false },
        { id: 'a2', patient_id: PATIENT, status: 'cancelled', scheduled_time: daysAgo(50), intake_completed: false },
      ],
    });

    const score = evaluateRiskSync(ctx, [churnRiskRule]);
    expect(score.flags).toHaveLength(0);
    expect(score.overallRisk).toBe('low');
  });

  it('defaultRules contains all 6 rules', () => {
    expect(defaultRules).toHaveLength(6);
    expect(defaultRules.map((r) => r.id)).toEqual(
      expect.arrayContaining([
        'no-show-risk',
        'churn-risk',
        'revenue-drop',
        'package-abandonment',
        'inventory-expiry',
        'follow-up-gap',
      ])
    );
  });

  it('handles a rule that throws an error gracefully', () => {
    const throwingRule = {
      id: 'throwing-rule',
      evaluate: () => { throw new Error('boom'); },
    };
    const ctx = makeCtx();
    const score = evaluateRiskSync(ctx, [throwingRule]);
    expect(score.flags).toHaveLength(0);
    expect(score.overallRisk).toBe('low');
  });
});

import type { RuleEvaluator } from '../../types';
import { noShowRiskRule } from './no-show-risk';
import { churnRiskRule } from './churn-risk';
import { revenueDropRule } from './revenue-drop';
import { packageAbandonmentRule } from './package-abandonment';
import { inventoryExpiryRule } from './inventory-expiry';
import { followUpGapRule } from './follow-up-gap';

export { noShowRiskRule } from './no-show-risk';
export { churnRiskRule } from './churn-risk';
export { revenueDropRule } from './revenue-drop';
export { packageAbandonmentRule } from './package-abandonment';
export { inventoryExpiryRule } from './inventory-expiry';
export { followUpGapRule } from './follow-up-gap';

export const defaultRules: RuleEvaluator[] = [
  noShowRiskRule,
  churnRiskRule,
  revenueDropRule,
  packageAbandonmentRule,
  inventoryExpiryRule,
  followUpGapRule,
];

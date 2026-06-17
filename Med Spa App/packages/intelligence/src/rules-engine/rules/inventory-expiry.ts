import type { RuleEvaluator, RiskFlag, RuleContext } from '../../types';

const EXPIRY_WARNING_DAYS = 30;

interface InventoryRecord {
  id: string;
  name: string;
  quantity: number;
  expiry_date: string;
  clinic_id: string;
}

export const inventoryExpiryRule: RuleEvaluator = {
  id: 'inventory-expiry',

  evaluate(ctx: RuleContext): RiskFlag[] {
    const inventory = (ctx as RuleContext & { inventory?: InventoryRecord[] }).inventory;
    if (!inventory || inventory.length === 0) return [];

    const now = Date.now();
    const warningCutoff = now + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000;

    const expiringSoon = inventory.filter(
      (item) => {
        const expiry = new Date(item.expiry_date).getTime();
        return expiry > now && expiry <= warningCutoff;
      }
    );

    if (expiringSoon.length === 0) return [];

    const totalValue = expiringSoon.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return [
      {
        type: 'inventory_expiry',
        severity: 'medium',
        reason: `${expiringSoon.length} product(s) expiring within ${EXPIRY_WARNING_DAYS} days`,
        action: 'Alert staff to use or discount before expiry',
        data: {
          expiring_count: expiringSoon.length,
          items: expiringSoon.map((i) => ({ name: i.name, quantity: i.quantity, expiry_date: i.expiry_date })),
          total_quantity: totalValue,
        },
      },
    ];
  },
};

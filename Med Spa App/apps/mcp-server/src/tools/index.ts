import type { MCPTool } from '../types.js';

import { sendSmsReminder } from './communications.js';
import { deductPackage } from './billing.js';
import { getTreatmentMetrics } from './reporting.js';
import { getRiskScore, getChurnPrediction } from './intelligence.js';
import { browseMarketplace, installModule, uninstallModule, listInstalledModules } from './marketplace.js';
import { scaffoldVertical } from './scaffold.js';
import { deployApp } from './deploy.js';

export { sendSmsReminder } from './communications.js';
export { deductPackage } from './billing.js';
export { getTreatmentMetrics } from './reporting.js';
export { getRiskScore, getChurnPrediction } from './intelligence.js';
export { browseMarketplace, installModule, uninstallModule, listInstalledModules } from './marketplace.js';
export { scaffoldVertical } from './scaffold.js';
export { deployApp } from './deploy.js';

export const allTools: MCPTool[] = [
  sendSmsReminder,
  deductPackage,
  getTreatmentMetrics,
  getRiskScore,
  getChurnPrediction,
  browseMarketplace,
  installModule,
  uninstallModule,
  listInstalledModules,
  scaffoldVertical,
  deployApp,
];

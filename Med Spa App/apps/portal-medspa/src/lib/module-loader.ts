import { callConnectApi } from './connect-client';

export interface InstalledModule {
  id: string;
  module_id: string;
  clinic_id: string;
  status: string;
  activated_at: string;
  cancelled_at?: string;
  marketplace_modules?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    pricing_model: string;
    price_cents: number;
  };
}

export async function getInstalledModules(clinicId: string): Promise<InstalledModule[]> {
  try {
    const result = await callConnectApi('GET', `/api/v1/marketplace/modules?clinic_id=${clinicId}`);
    return (result.installed as InstalledModule[]) ?? [];
  } catch {
    return [];
  }
}

export async function enableModule(clinicId: string, moduleId: string): Promise<void> {
  await callConnectApi('POST', '/api/v1/marketplace/install', {
    clinic_id: clinicId,
    module_id: moduleId,
  });
}

export async function disableModule(clinicId: string, moduleId: string): Promise<void> {
  await callConnectApi('DELETE', `/api/v1/marketplace/install?clinic_id=${clinicId}&module_id=${moduleId}`);
}

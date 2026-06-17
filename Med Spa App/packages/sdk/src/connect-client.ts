import type {
  SmsReminderParams,
  DeductPackageParams,
  TreatmentMetricsParams,
  RiskScoreParams,
  ChurnPredictionParams,
  ChurnPredictionResult,
  MarketplaceBrowseParams,
  MarketplaceInstallParams,
} from './types.js';

export class ConnectClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl ?? process.env.CONNECT_API_URL ?? 'http://localhost:3001';
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: object
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Connect API error (${res.status}): ${JSON.stringify(err)}`);
    }

    return res.json() as Promise<T>;
  }

  async sendSmsReminder(params: SmsReminderParams) {
    return this.request('POST', '/api/v1/communications/sms-reminder', params);
  }

  async deductPackage(params: DeductPackageParams) {
    return this.request('POST', '/api/v1/billing/package-deduct', params);
  }

  async getTreatmentMetrics(params: TreatmentMetricsParams) {
    return this.request('POST', '/api/v1/reporting/treatment-metrics', params);
  }

  async getRiskScore(params: RiskScoreParams) {
    return this.request('POST', '/api/v1/intelligence/risk-score', params);
  }

  async getChurnPrediction(params: ChurnPredictionParams): Promise<ChurnPredictionResult> {
    return this.request('POST', '/api/v1/intelligence/churn-prediction', params);
  }

  async browseMarketplace(params?: MarketplaceBrowseParams) {
    const query = params
      ? `?${new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
          )
        ).toString()}`
      : '';
    return this.request('GET', `/api/v1/marketplace/modules${query}`);
  }

  async installModule(params: MarketplaceInstallParams) {
    return this.request('POST', '/api/v1/marketplace/install', params);
  }

  async uninstallModule(clinicId: string, moduleId: string) {
    return this.request('DELETE', `/api/v1/marketplace/install?clinic_id=${clinicId}&module_id=${moduleId}`);
  }

  async getInstalledModules(clinicId: string) {
    return this.request('GET', `/api/v1/marketplace/modules?clinic_id=${clinicId}`);
  }
}

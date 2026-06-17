export type ModuleCategory = 'integration' | 'automation' | 'reporting' | 'ai' | 'ui' | 'other';
export type ModuleStatus = 'draft' | 'published' | 'deprecated';
export type PricingModel = 'free' | 'one_time' | 'subscription' | 'usage_based';

export interface ModuleManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  vertical?: string;
  category: ModuleCategory;
  dependencies?: string[];
  pricing: {
    model: PricingModel;
    price_cents?: number;
    interval?: 'month' | 'year';
  };
  entryPoint: string;
  permissions?: string[];
}

// Field names match the marketplace_modules DB columns (snake_case)
export interface MarketplaceModule {
  id: string;
  slug: string;
  name: string;
  description: string;
  author_id: string;
  vertical?: string;
  category: ModuleCategory;
  pricing_model: PricingModel;
  price_cents: number;
  status: ModuleStatus;
  latest_version: string;
  install_count: number;
  created_at: string;
  updated_at: string;
}

// Field names match the marketplace_subscriptions DB columns (snake_case)
export interface MarketplaceSubscription {
  id: string;
  clinic_id: string;
  module_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'cancelled' | 'past_due';
  activated_at: string;
  cancelled_at?: string;
}

export interface ModuleVersion {
  id: string;
  module_id: string;
  version: string;
  changelog?: string;
  manifest: ModuleManifest;
  published_at: string;
}

export interface SearchResult {
  modules: MarketplaceModule[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InstallResult {
  subscription: MarketplaceSubscription;
  module: MarketplaceModule;
}

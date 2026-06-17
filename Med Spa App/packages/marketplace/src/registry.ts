import type { SupabaseClient } from '@supabase/supabase-js';
import type { MarketplaceModule, SearchResult, MarketplaceSubscription, InstallResult, ModuleCategory } from './types';

export interface SearchParams {
  vertical?: string;
  category?: ModuleCategory;
  query?: string;
  page?: number;
  pageSize?: number;
}

export async function searchModules(
  params: SearchParams,
  client: SupabaseClient
): Promise<SearchResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = client
    .from('marketplace_modules')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('install_count', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (params.vertical) query = query.eq('vertical', params.vertical);
  if (params.category) query = query.eq('category', params.category);
  if (params.query) query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Marketplace search failed: ${error.message}`);
  }

  return {
    modules: (data ?? []) as MarketplaceModule[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getModule(
  moduleId: string,
  client: SupabaseClient
): Promise<MarketplaceModule | null> {
  const { data, error } = await client
    .from('marketplace_modules')
    .select('*')
    .eq('id', moduleId)
    .single();

  if (error) return null;
  return data as MarketplaceModule;
}

export async function installModule(
  clinicId: string,
  moduleId: string,
  client: SupabaseClient
): Promise<InstallResult> {
  const module = await getModule(moduleId, client);
  if (!module) {
    throw new Error('Module not found');
  }

  const { data: existing } = await client
    .from('marketplace_subscriptions')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('module_id', moduleId)
    .eq('status', 'active')
    .single();

  if (existing) {
    throw new Error('Module already installed');
  }

  const { data, error } = await client
    .from('marketplace_subscriptions')
    .insert({
      clinic_id: clinicId,
      module_id: moduleId,
      status: 'active',
      activated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Install failed: ${error.message}`);
  }

  const { error: rpcError } = await client.rpc('increment_install_count', { p_module_id: moduleId });
  if (rpcError) {
    console.error(`Failed to increment install count for module ${moduleId}: ${rpcError.message}`);
  }

  return {
    subscription: data as MarketplaceSubscription,
    module,
  };
}

export async function uninstallModule(
  clinicId: string,
  moduleId: string,
  client: SupabaseClient
): Promise<void> {
  const { error } = await client
    .from('marketplace_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('clinic_id', clinicId)
    .eq('module_id', moduleId)
    .eq('status', 'active');

  if (error) {
    throw new Error(`Uninstall failed: ${error.message}`);
  }
}

export async function getInstalledModules(
  clinicId: string,
  client: SupabaseClient
): Promise<MarketplaceSubscription[]> {
  const { data, error } = await client
    .from('marketplace_subscriptions')
    .select('*, marketplace_modules(*)')
    .eq('clinic_id', clinicId)
    .eq('status', 'active')
    .order('activated_at', { ascending: false });

  if (error) {
    throw new Error(`Fetch installed modules failed: ${error.message}`);
  }

  return (data ?? []) as MarketplaceSubscription[];
}

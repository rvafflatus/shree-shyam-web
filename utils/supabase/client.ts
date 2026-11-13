import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

let browserClient: SupabaseClient | undefined;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  if (typeof window !== 'undefined' && browserClient) {
    return browserClient;
  }

  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  if (typeof window !== 'undefined') {
    browserClient = client;
  }
  return client;
}

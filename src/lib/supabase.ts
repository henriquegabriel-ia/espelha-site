import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client only when env vars are available (Lovable Cloud / configured local)
// In dev without Supabase, the UI renders normally — calls fail gracefully
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as SupabaseClient, {
      get(_, prop) {
        if (prop === 'functions') {
          return {
            invoke: async () => ({
              data: null,
              error: {
                message: 'Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env',
              },
            }),
          };
        }
        return undefined;
      },
    });

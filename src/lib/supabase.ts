import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[VENUS Supabase Warning]: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not configured. Running with local development fallback.'
  );
}

// Create and export the Supabase client
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface EnquiryRecord {
  id: string;
  customer_name: string;
  email: string;
  mobile: string;
  message: string;
  created_at: string;
  email_status: string;
  sms_status: string;
}

export interface AdminUserRecord {
  id: string;
  user_id: string;
  created_at: string;
}

// lib/supabase_admin.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Make sure this is in your .env.local and NOT prefixed with NEXT_PUBLIC
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const createAdminSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

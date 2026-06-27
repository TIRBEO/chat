import { createClient } from "@supabase/supabase-js";

const APPS_URL = import.meta.env.VITE_APPS_SUPABASE_URL as string;
const APPS_ANON_KEY = import.meta.env.VITE_APPS_SUPABASE_ANON_KEY as string;

export const appsSupabase = createClient(APPS_URL, APPS_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

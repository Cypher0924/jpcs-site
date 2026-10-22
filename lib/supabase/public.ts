import { createClient } from "@supabase/supabase-js";

// no cookies, so it's safe inside 'use cache'. reads only what RLS allows anon to see
export function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

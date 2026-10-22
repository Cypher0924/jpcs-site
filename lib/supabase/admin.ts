import "server-only";
import { createClient } from "@supabase/supabase-js";

// secret key: bypasses RLS. only for auth.admin.* (team invites), cron backups and the image sweep
export function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

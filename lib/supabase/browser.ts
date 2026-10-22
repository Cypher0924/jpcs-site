import { createBrowserClient } from "@supabase/ssr";

// sign-in runs in the browser so Supabase's per-IP rate limit sees each person, not Vercel's shared IPs
export function browserClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}

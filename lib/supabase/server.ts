import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// the signed-in user's client for admin pages and server actions. writes go through RLS as that user
export async function sessionClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        // throws when called from a server component. proxy.ts refreshes the session there instead
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/util/supabase/server";

/**
 * Returns the authenticated user's ID for the current request.
 *
 * Wrapped with React.cache() so that multiple Server Components (or Server
 * Actions called during the same render pass) share one Supabase round-trip
 * per request instead of each making their own auth.getUser() call.
 *
 * React.cache scope is per-request — no sharing between requests.
 */
export const getCurrentUserId = cache(async (): Promise<string> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
});

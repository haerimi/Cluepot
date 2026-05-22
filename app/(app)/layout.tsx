import { cookies } from "next/headers";
import { createClient } from "@/util/supabase/server";
import { AppSidebar } from "./_components/AppSidebar";
import { AppTopNav } from "./_components/AppTopNav";
import { AuthHydrator, type HydratedUser } from "./_components/AuthHydrator";

/**
 * Authenticated app shell — wraps every route inside (app)/.
 *
 * Why async Server Component?
 *   Reading the Supabase session requires `cookies()`, which is async in
 *   Next.js 15+. We read the user here once per navigation so that:
 *     1. AppSidebar / AppTopNav always render the correct user state on the
 *        first paint — no flash of "logged-out" UI.
 *     2. AuthHydrator syncs the same data into Zustand for client components
 *        that need reactive access (room page, etc.).
 *
 * Why (app) route group?
 *   Parentheses strip the segment from the URL. /room/[code], /calendar, and
 *   /profile all live here to share this shell without affecting their paths.
 *   The home page, /room/create, and /room/join sit outside (app) and receive
 *   only the root layout — no sidebar shell.
 *
 * Height model:
 *   Outer div owns the full viewport height and clips overflow. Each column
 *   (sidebar + content area) manages its own internal scroll so the browser
 *   scroll bar never jumps between route transitions.
 */
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userProps: HydratedUser | null = null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    userProps = user
      ? {
          id: user.id,
          email: user.email ?? "",
          nickname: (user.user_metadata?.nickname as string | undefined) ?? "",
          profileImage:
            (user.user_metadata?.avatar_url as string | undefined) ?? "",
        }
      : null;
  }

  return (
    <div className="flex h-dvh bg-canvas overflow-hidden">
      {/* Populates Zustand user store client-side without an extra fetch */}
      <AuthHydrator user={userProps} />

      {/* Desktop persistent sidebar */}
      <AppSidebar user={userProps} />

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile / tablet top bar — hidden on lg+ */}
        <AppTopNav user={userProps} />
        {children}
      </div>
    </div>
  );
}

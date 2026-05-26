import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/util/supabase/middleware";

/**
 * Protected paths — unauthenticated visitors are redirected to /login.
 * /rooms/create is listed here; /rooms/[code] is handled separately via isRoomPage.
 */
const PROTECTED_PREFIXES = ["/calendar", "/profile", "/settings", "/rooms/create"];

/** Auth pages — authenticated users are bounced back to home. */
const AUTH_EXACT = new Set(["/login", "/signup"]);

export async function middleware(request: NextRequest) {
  // If Supabase credentials are not yet configured, pass all requests through
  // so the rest of the app continues to work while auth is being set up.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return NextResponse.next({ request });
  }

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  // /rooms/join is public (code entry before auth). /rooms/[code] requires login
  // because the room page reads participant data tied to the authenticated user.
  const isRoomPage = pathname.startsWith("/rooms/") && pathname !== "/rooms/join" && !pathname.startsWith("/rooms/create");
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) || isRoomPage;
  const isAuthPage = AUTH_EXACT.has(pathname);

  if (isProtected && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match every path except Next.js internals and static assets.
     * The session must be refreshed on every navigable route so that
     * Server Components always see an up-to-date auth state.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

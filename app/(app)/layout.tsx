import { AppSidebar } from "./_components/AppSidebar";

/**
 * Why App Router route group layout here?
 *
 * `(app)` is a route group — the parentheses mean this folder is invisible
 * to the URL router. `/room/[code]` stays exactly `/room/[code]` in the browser.
 *
 * What it buys us:
 *   - The landing page (app/page.tsx), /room/create, and /room/join live
 *     OUTSIDE (app)/ so they receive only the root layout — no sidebar shell.
 *   - Every page inside (app)/ — now just /room/[code], and future /calendar,
 *     /schedule/[id] — automatically inherits this persistent shell without
 *     any per-page wiring.
 *   - This layout is a Server Component. Only AppSidebar is a Client Component
 *     (it needs Zustand reads). The `children` prop threads server-rendered
 *     page content through without re-rendering it on the client.
 *
 * Height model:
 *   The outer div owns the full viewport height and hides overflow. Each
 *   column (sidebar + content area) manages its own internal scrolling.
 *   This prevents the browser scroll bar from jumping between pages.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh bg-[#F4F2EE] overflow-hidden">
      <AppSidebar />
      {/* Content area — takes remaining width, manages its own overflow */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

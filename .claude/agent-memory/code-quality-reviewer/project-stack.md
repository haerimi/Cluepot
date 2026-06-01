---
name: project-stack
description: MeetSpot/CluePot tech stack and version-specific Next.js conventions confirmed from node_modules docs
metadata:
  type: project
---

CluePot (package name `cluepot`) is an AI meetup-coordination app.

Stack (from package.json):
- next 16.2.6, react 19.2.4, react-dom 19.2.4
- @prisma/client 7.8 with @prisma/adapter-pg (driver adapter, generated client at `@/generated/prisma/client`)
- @supabase/ssr 0.10 for auth (env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
- zustand 5 for client state (stores in /store)
- @google/genai (Gemini, model `gemini-3.1-flash-lite`) for the PINI recommendation engine at app/api/pini/route.ts
- Kakao Local + Naver Blog APIs for geocoding/place search/reviews

Next.js 16 version-specific facts (verified in node_modules/next/dist/docs):
- **Middleware is renamed to Proxy in Next 16.** Convention is now `proxy.ts` with a `proxy` export. The repo still uses `middleware.ts` with `middleware` export (works via back-compat but is the legacy form).
- `refresh()` is now available from `next/cache` to refresh the client router after a Server Action.
- Route Handlers support `RouteContext<'/path/[id]'>` global helper for typing params; params are async (`await ctx.params`).
- GET route handlers are not cached by default.

**How to apply:** When reviewing Next.js APIs here, treat the installed docs as authoritative over training data. Flag `middleware.ts` as legacy-Proxy naming.

Route group layout:
- `(app)` group: /calendar, /profile, /rooms, /rooms/[code] — shares authenticated shell (AppSidebar + AppTopNav).
- `(standalone)/room/`: routes are `/room/create` and `/room/join` (SINGULAR "room").
- `(auth)`: /login, /signup.
- Home `/` is outside all groups.

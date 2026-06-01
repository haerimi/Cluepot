---
name: recurring-issues
description: Recurring bug/quality patterns found in CluePot during code review
metadata:
  type: project
---

Patterns observed (verify still present before acting — these are review-time snapshots):

1. **Route path mismatch `/room` vs `/rooms`.** Actual standalone routes are `/room/create` and `/room/join` (singular). But `middleware.ts` protects/whitelists `/rooms/create` and `/rooms/join`, and `app/(app)/rooms/page.tsx` empty-state links to `/room/create`+`/room/join` correctly while other spots vary. AppSidebar line ~170 had `href="room/join"` with NO leading slash (resolves relative to current path — broken). Always grep both spellings when touching navigation/auth.

2. **RoomStatus type drift.** `types/room.ts` declares `RoomStatus = 'waiting' | 'voting' | 'done'`, but code writes `"reselecting"` (schedule.ts cancelSchedule) and `"done"`. Schema column is a free String with default "waiting". The hand-written /types/* interfaces are decorative and NOT derived from Prisma — they drift from the generated client. Prefer importing Prisma-generated types.

3. **Prisma client lacks dev singleton.** lib/prisma.ts instantiates `new PrismaClient()` at module scope with no `globalThis` guard — in dev with HMR this leaks PG connections. Standard fix: cache on globalThis when not production.

**How to apply:** These are the first things to re-check in any navigation, auth, or Prisma-related review.

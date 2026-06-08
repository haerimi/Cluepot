---
name: recurring-issues
description: Recurring bug/quality patterns found in CluePot during code review
metadata:
  type: project
---

Patterns observed (verify still present before acting — these are review-time snapshots):

1. **Route paths now consistent at `/rooms/...` (RESOLVED as of 2026-06-03 review).** Standalone routes are `/rooms/create` and `/rooms/join` (plural). middleware.ts, AppSidebar, rooms/page.tsx all agree. The old `/room` singular mismatch is gone. Still worth a quick grep when touching navigation.

2. **RoomStatus type drift (STILL PRESENT).** `types/room.ts` declares `RoomStatus = 'waiting' | 'voting' | 'done'`, but code writes `"reselecting"` (schedule.ts cancelSchedule) and reads it (RoomCard STATUS_CONFIG, room page). The hand-written /types/* interfaces are decorative and NOT derived from Prisma — they drift from the generated client. The Zustand room store types roomStatus as RoomStatus, so setting "reselecting" would be a type error there. Prefer importing Prisma-generated types or widening the union to include 'reselecting'.

3. **Prisma client dev singleton (RESOLVED).** lib/prisma.ts now caches on globalThis when NODE_ENV !== production. Good.

4. **Server Actions trust client-supplied authorization flags / lack membership checks (2026-06-03; reconfirmed 2026-06-08).** rooms.ts `extendRoomLink(roomCode, isHost)` and `updateRoom` take the host/identity decision from the CLIENT and never verify server-side. participant.ts `saveAvailableDates` also has NO membership/leftAt check and no length cap (client caps at 5, server accepts any length). `savePreference` and `getParticipants` DO guard with a leftAt check — use them as the template. Treat all "use server" mutations as public endpoints — re-derive identity from getCurrentUserId() and verify membership/ownership in the action.

5. **Date-only (@db.Date) round-trip via `new Date(str)` + `toISOString().slice(0,10)` is timezone-fragile (2026-06-08).** participant.ts saveAvailableDates/getAvailableDates store local-built "YYYY-MM-DD" keys as `new Date(date)` (parsed as UTC midnight) into a @db.Date column. Works today but breaks if column becomes DateTime or the pg adapter materializes the Date at server-local midnight. Pin writes to UTC (`new Date(\`${date}T00:00:00Z\`)`) or keep dates as plain strings end-to-end.

6. **Defined-but-never-called server actions (2026-06-08).** participant.ts `getAvailableDates` and `getRecommendedDates` exist but are not called anywhere. Consequence: saved availability dates are NOT restored on room-page refresh (myDates re-inits to []). getRecommendedDates also returns raw userIds (identity leak) and its per-date count can exceed `total` active participants since it counts left users. Re-check whether these got wired up before relying on them.

**How to apply:** These are the first things to re-check in any navigation, auth, or Prisma-related review.

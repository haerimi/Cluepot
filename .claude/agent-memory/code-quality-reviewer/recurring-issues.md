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

4. **Server Actions trust client-supplied authorization flags / lack membership checks (2026-06-03).** rooms.ts `extendRoomLink(roomCode, isHost)` and `updateRoom` take the host/identity decision from the CLIENT and never verify server-side that the caller is the host of that room. Any authenticated user can call these actions directly with arbitrary roomCode. `leaveRoom` does check membership. Treat all "use server" mutations as public endpoints — re-derive identity from getCurrentUserId() and verify ownership in the action.

**How to apply:** These are the first things to re-check in any navigation, auth, or Prisma-related review.

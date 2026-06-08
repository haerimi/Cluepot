# Code Quality Reviewer — MeetSpot/CluePot

- [Stack & Conventions](project-stack.md) — Next.js 16.2.6 (Proxy not Middleware), React 19, Prisma 7, Supabase SSR, Zustand 5
- [Recurring Issues](recurring-issues.md) — route path mismatches (/room vs /rooms), RoomStatus type drift, prisma singleton missing
- [Mobile API v1](mobile-api-v1.md) — REST surface at app/api/v1 (Bearer-token mobile-auth); parallels Server Actions, repeats auth/validation gaps

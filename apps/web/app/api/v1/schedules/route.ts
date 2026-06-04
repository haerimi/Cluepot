import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId, unauthorized, badRequest, ok } from "@/lib/api-auth";

/** GET /api/v1/schedules — 내 일정 목록 */
export async function GET(req: NextRequest) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const rows = await prisma.schedule.findMany({
    where: { members: { some: { userId } } },
    include: { members: { select: { userId: true, status: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  return ok(
    rows.map((s) => ({
      id: s.id,
      title: s.title,
      placeName: s.placeName,
      placeAddress: s.placeAddress,
      scheduledAt: s.scheduledAt.toISOString(),
      createdBy: s.createdBy,
      memberCount: s.members.length,
      myStatus: s.members.find((m) => m.userId === userId)?.status ?? "pending",
    })),
  );
}

/** POST /api/v1/schedules — 일정 생성 */
export async function POST(req: NextRequest) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.roomCode || !body?.title || !body?.placeName || !body?.scheduledAt) {
    return badRequest("필수 항목이 누락됐어요.");
  }

  const { roomCode, category, title, placeName, placeAddress, lat, lng, scheduledAt, memo } = body;

  await prisma.room.upsert({
    where: { roomCode },
    update: { status: "done" },
    create: { roomCode, category: category ?? "restaurant", status: "done" },
  });

  const participants = await prisma.participant.findMany({
    where: { roomCode },
    select: { userId: true },
  });

  const memberIds = new Set<string>(participants.map((p) => p.userId));
  memberIds.add(userId);

  const schedule = await prisma.schedule.create({
    data: {
      roomCode,
      title,
      placeName,
      placeAddress: placeAddress ?? "",
      lat: lat ?? 0,
      lng: lng ?? 0,
      scheduledAt: new Date(scheduledAt),
      memo: memo ?? null,
      createdBy: userId,
      members: {
        create: Array.from(memberIds).map((uid) => ({
          userId: uid,
          status: uid === userId ? "accepted" : "pending",
        })),
      },
    },
    select: { id: true },
  });

  return ok({ id: schedule.id }, 201);
}

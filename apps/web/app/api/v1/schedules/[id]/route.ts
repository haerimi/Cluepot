import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId, unauthorized, ok } from "@/lib/api-auth";

/** GET /api/v1/schedules/:id — 일정 상세 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const { id: scheduleId } = await params;

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      members: {
        include: { user: { select: { id: true, nickname: true, profileImage: true } } },
      },
    },
  });

  if (!schedule) {
    return new Response(JSON.stringify({ error: "일정을 찾을 수 없어요." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isMember = schedule.members.some((m) => m.userId === userId);
  if (!isMember) return unauthorized();

  return ok({
    id: schedule.id,
    title: schedule.title,
    placeName: schedule.placeName,
    placeAddress: schedule.placeAddress,
    lat: schedule.lat,
    lng: schedule.lng,
    scheduledAt: schedule.scheduledAt.toISOString(),
    memo: schedule.memo,
    createdBy: schedule.createdBy,
    createdAt: schedule.createdAt.toISOString(),
    roomCode: schedule.roomCode,
    currentUserId: userId,
    members: schedule.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      status: m.status,
      nickname: m.user.nickname,
      profileImage: m.user.profileImage,
    })),
  });
}

/** GET /api/v1/schedules/by-room/:code 대신 쿼리 파라미터로 처리 */

/** DELETE /api/v1/schedules/:id — 일정 삭제 (생성자만) */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const { id: scheduleId } = await params;

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { createdBy: true },
  });

  if (!schedule || schedule.createdBy !== userId) return unauthorized();

  await prisma.schedule.delete({ where: { id: scheduleId } });

  return ok({ ok: true });
}

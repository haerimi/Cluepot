import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId, unauthorized, ok } from "@/lib/api-auth";

/** GET /api/v1/rooms/:code — 방 존재 여부 + 유효성 확인 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const { code } = await params;
  const roomCode = code.toUpperCase();

  const room = await prisma.room.findUnique({ where: { roomCode } });
  if (!room) return ok({ valid: false, reason: "존재하지 않는 모임 코드예요." });
  if (room.linkExpiresAt < new Date())
    return ok({ valid: false, reason: "만료된 초대코드예요." });

  return ok({ valid: true, expiresAt: room.linkExpiresAt.toISOString() });
}

/** DELETE /api/v1/rooms/:code — 방 나가기 (호스트면 방 삭제) */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const { code } = await params;
  const roomCode = code.toUpperCase();

  const participant = await prisma.participant.findUnique({
    where: { roomCode_userId: { roomCode, userId } },
  });
  if (!participant) return ok({ ok: true });

  if (participant.isHost) {
    await prisma.room.delete({ where: { roomCode } });
  } else {
    await prisma.participant.update({
      where: { roomCode_userId: { roomCode, userId } },
      data: { leftAt: new Date() },
    });

    const schedule = await prisma.schedule.findUnique({ where: { roomCode } });
    if (schedule) {
      await prisma.scheduleMember.deleteMany({ where: { scheduleId: schedule.id, userId } });
    }
  }

  return ok({ ok: true });
}

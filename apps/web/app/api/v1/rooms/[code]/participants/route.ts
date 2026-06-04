import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId, unauthorized, ok } from "@/lib/api-auth";

/** GET /api/v1/rooms/:code/participants — 참가자 목록 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const { code } = await params;
  const roomCode = code.toUpperCase();

  const self = await prisma.participant.findUnique({
    where: { roomCode_userId: { roomCode, userId } },
  });
  if (!self || self.leftAt !== null) {
    return new Response(JSON.stringify({ error: "이 방의 참가자가 아닙니다." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const participants = await prisma.participant.findMany({
    where: { roomCode, leftAt: null },
    include: {
      user: { select: { nickname: true, profileImage: true } },
    },
  });

  return ok({ participants });
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId, unauthorized, badRequest, ok } from "@/lib/api-auth";

/** POST /api/v1/rooms/:code/preference — 선호 저장 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const { code } = await params;
  const roomCode = code.toUpperCase();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("요청 본문이 필요해요.");

  const { abstractLocation, lat, lng, transports, distanceTolerance, atmospherePreference } = body;

  const participant = await prisma.participant.findUnique({
    where: { roomCode_userId: { roomCode, userId } },
  });
  if (!participant || participant.leftAt !== null) {
    return new Response(
      JSON.stringify({ ok: false, reason: "이미 방에서 나간 상태라 선호를 저장할 수 없어요." }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  await prisma.participant.update({
    where: { roomCode_userId: { roomCode, userId } },
    data: { abstractLocation, lat: lat ?? 0, lng: lng ?? 0, transports, distanceTolerance, atmospherePreference },
  });

  return ok({ ok: true });
}

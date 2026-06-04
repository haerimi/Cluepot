import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId, unauthorized, ok } from "@/lib/api-auth";

/** POST /api/v1/rooms/:code/join — 방 참가 (upsert) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const { code } = await params;
  const roomCode = code.toUpperCase();

  const participant = await prisma.$transaction(async (tx) => {
    const count = await tx.participant.count({ where: { roomCode } });
    return tx.participant.upsert({
      where: { roomCode_userId: { roomCode, userId } },
      update: { leftAt: null },
      create: {
        roomCode,
        userId,
        isHost: count === 0,
        abstractLocation: "",
        lat: 0,
        lng: 0,
      },
      include: {
        room: { select: { linkExpiresAt: true, category: true, status: true } },
      },
    });
  });

  const hasSaved = participant.abstractLocation !== "";

  return ok({
    participantId: participant.id,
    isHost: participant.isHost,
    linkExpiresAt: participant.room.linkExpiresAt.toISOString(),
    category: participant.room.category,
    roomStatus: participant.room.status,
    savedPreference: hasSaved
      ? {
          abstractLocation: participant.abstractLocation,
          transports: participant.transports,
          distanceTolerance: participant.distanceTolerance,
          atmospherePreference: participant.atmospherePreference,
        }
      : null,
  });
}

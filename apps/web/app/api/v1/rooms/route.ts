import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId, unauthorized, badRequest, ok } from "@/lib/api-auth";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** GET /api/v1/rooms — 내가 참가 중인 방 목록 */
export async function GET(req: NextRequest) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const rows = await prisma.participant.findMany({
    where: { userId, leftAt: null },
    include: {
      room: {
        include: { schedule: { select: { id: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok(rows);
}

/** POST /api/v1/rooms — 방 생성 */
export async function POST(req: NextRequest) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.category || !body?.name) return badRequest("category와 name이 필요해요.");

  const { category, name } = body;
  const roomCode = generateCode();

  const room = await prisma.$transaction(async (tx) => {
    const room = await tx.room.create({
      data: {
        roomCode,
        category,
        name,
        linkExpiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      },
    });
    await tx.participant.create({
      data: { roomCode, userId, isHost: true, abstractLocation: "", lat: 0, lng: 0 },
    });
    return room;
  });

  return ok({ roomCode: room.roomCode, roomId: room.id }, 201);
}

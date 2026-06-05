import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { code: roomCode } = await params;
    const userId = user.id;

    const participant = await prisma.$transaction(async (tx) => {
      const count = await tx.participant.count({ where: { roomCode } });
      return tx.participant.upsert({
        where: { roomCode_userId: { roomCode, userId } },
        update: { leftAt: null },
        create: { roomCode, userId, isHost: count === 0, abstractLocation: '', lat: 0, lng: 0 },
        include: { room: { select: { linkExpiresAt: true, category: true, status: true } } },
      });
    });

    const hasSaved = participant.abstractLocation !== '';
    return NextResponse.json({
      participantId: participant.id,
      isHost: participant.isHost,
      linkExpiresAt: participant.room.linkExpiresAt.toISOString(),
      category: participant.room.category,
      roomStatus: participant.room.status,
      savedPreference: hasSaved ? {
        abstractLocation: participant.abstractLocation,
        transports: participant.transports,
        distanceTolerance: participant.distanceTolerance,
        atmospherePreference: participant.atmospherePreference,
      } : null,
    });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
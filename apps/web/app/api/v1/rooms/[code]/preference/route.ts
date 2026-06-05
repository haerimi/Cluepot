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

    const { abstractLocation, lat, lng, transports, distanceTolerance, atmospherePreference } = await req.json();

    const participant = await prisma.participant.findUnique({
      where: { roomCode_userId: { roomCode, userId } },
    });
    if (!participant || participant.leftAt !== null) {
      return NextResponse.json({ error: '이 방의 참가자가 아닙니다.' }, { status: 403 });
    }

    await prisma.participant.update({
      where: { roomCode_userId: { roomCode, userId } },
      data: { abstractLocation, lat, lng, transports, distanceTolerance, atmospherePreference },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
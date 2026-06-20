import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { code: roomCode } = await params;
    const userId = user.id;

    const self = await prisma.participant.findUnique({
      where: { roomCode_userId: { roomCode, userId } },
    });
    if (!self || self.leftAt !== null) {
      return NextResponse.json({ error: '이 방의 참가자가 아닙니다.' }, { status: 403 });
    }

    const participants = await prisma.participant.findMany({
      where: { roomCode, leftAt: null },
      include: { user: { select: { nickname: true, profileImage: true } } },
    });

    return NextResponse.json({ participants });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { code: roomCode } = await params;
    const userId = user.id;

    const participant = await prisma.participant.findUnique({
      where: { roomCode_userId: { roomCode, userId } },
      select: { isHost: true, leftAt: true },
    });
    if (!participant || participant.leftAt !== null) {
      return NextResponse.json({ error: '참여하지 않은 모임이에요.' }, { status: 403 });
    }
    if (participant.isHost) {
      return NextResponse.json({ error: '호스트는 방을 나갈 수 없어요. 모임을 삭제해주세요.' }, { status: 400 });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { roomCode },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.participant.update({
        where: { roomCode_userId: { roomCode, userId } },
        data: { leftAt: new Date() },
      }),
      ...(schedule
        ? [prisma.scheduleMember.deleteMany({ where: { scheduleId: schedule.id, userId } })]
        : []),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /rooms/:code/participants]', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const room = await prisma.room.findUnique({
        where: { roomCode: code }
    });

    if(!room) return NextResponse.json({ valid: false, reason: "존재하지 않는 모임 코드에요."});

    if(room.linkExpiresAt < new Date()) return NextResponse.json({ valid: false, reason: "만료된 초대코드예요." });
    return NextResponse.json({ valid: true, expiresAt: room.linkExpiresAt.toISOString()});
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

    const participant = await prisma.participant.findUnique({
      where: { roomCode_userId: { roomCode, userId: user.id } },
      select: { isHost: true },
    });
    if (!participant) return NextResponse.json({ error: '참여하지 않은 모임이에요.' }, { status: 403 });
    if (!participant.isHost) return NextResponse.json({ error: '호스트만 삭제할 수 있어요.' }, { status: 403 });

    await prisma.room.delete({ where: { roomCode } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /rooms/:code]', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
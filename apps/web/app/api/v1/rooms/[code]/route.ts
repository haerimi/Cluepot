import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'

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
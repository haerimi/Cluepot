import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const userId = user.id;

    const rows = await prisma.schedule.findMany({
      where: { members: { some: { userId } } },
      include: { members: { select: { userId: true, status: true } } },
      orderBy: { scheduledAt: 'asc' },
    });

    const schedules = rows.map((s) => ({
      id: s.id,
      title: s.title,
      placeName: s.placeName,
      placeAddress: s.placeAddress,
      scheduledAt: s.scheduledAt.toISOString(),
      memberCount: s.members.length,
      myStatus: s.members.find((m) => m.userId === userId)?.status ?? 'pending',
    }));

    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
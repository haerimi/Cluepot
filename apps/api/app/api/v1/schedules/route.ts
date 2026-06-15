import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const userId = user.id;
    const { roomCode, title, placeName, placeAddress, lat, lng, scheduledAt, memo } = await req.json();

    if (!roomCode || !title || !placeName || !scheduledAt) {
      return NextResponse.json({ error: '필수 항목이 누락됐어요.' }, { status: 400 });
    }

    const schedule = await prisma.$transaction(async (tx) => {
      await tx.room.update({ where: { roomCode }, data: { status: 'done' } });

      const participants = await tx.participant.findMany({
        where: { roomCode },
        select: { userId: true },
      });

      const memberIds = new Set<string>(participants.map((p) => p.userId));
      memberIds.add(userId);

      return tx.schedule.create({
        data: {
          roomCode,
          title,
          placeName,
          placeAddress,
          lat: lat ?? 0,
          lng: lng ?? 0,
          scheduledAt: new Date(scheduledAt),
          memo: memo ?? null,
          createdBy: userId,
          members: {
            create: Array.from(memberIds).map((uid) => ({
              userId: uid,
              status: uid === userId ? 'accepted' : 'pending',
            })),
          },
        },
        select: { id: true },
      });
    });

    return NextResponse.json({ id: schedule.id });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

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
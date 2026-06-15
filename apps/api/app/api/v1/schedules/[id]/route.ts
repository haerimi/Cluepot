import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { id } = await params;
    const userId = user.id;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, nickname: true, profileImage: true } } },
        },
      },
    });

    if (!schedule) return NextResponse.json({ error: '일정을 찾을 수 없어요.' }, { status: 404 });

    const myMember = schedule.members.find((m) => m.userId === userId);
    if (!myMember) return NextResponse.json({ error: '접근 권한이 없어요.' }, { status: 403 });

    return NextResponse.json({
      id: schedule.id,
      title: schedule.title,
      scheduledAt: schedule.scheduledAt.toISOString(),
      placeName: schedule.placeName,
      placeAddress: schedule.placeAddress,
      lat: schedule.lat,
      lng: schedule.lng,
      memo: schedule.memo,
      isCreator: schedule.createdBy === userId,
      myStatus: myMember.status,
      participants: schedule.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        nickname: m.user.nickname,
        profileImage: m.user.profileImage,
        status: m.status,
        isMe: m.userId === userId,
      })),
    });
  } catch (e) {
    console.error('[GET /schedules/:id]', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { id } = await params;

    const schedule = await prisma.schedule.findUnique({ where: { id } });
    if (!schedule) return NextResponse.json({ error: '일정을 찾을 수 없어요.' }, { status: 404 });
    if (schedule.createdBy !== user.id) return NextResponse.json({ error: '수정 권한이 없어요.' }, { status: 403 });

    const body = await req.json();
    const data: { title?: string; memo?: string | null; scheduledAt?: Date } = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.memo !== undefined) data.memo = body.memo ?? null;
    if (body.scheduledAt !== undefined) data.scheduledAt = new Date(body.scheduledAt);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: '수정할 항목이 없어요.' }, { status: 400 });
    }

    const updated = await prisma.schedule.update({ where: { id }, data });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      scheduledAt: updated.scheduledAt.toISOString(),
      memo: updated.memo,
    });
  } catch (e) {
    console.error('[PATCH /schedules/:id]', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { id } = await params;

    const schedule = await prisma.schedule.findUnique({ where: { id } });
    if (!schedule) return NextResponse.json({ error: '일정을 찾을 수 없어요.' }, { status: 404 });
    if (schedule.createdBy !== user.id) return NextResponse.json({ error: '삭제 권한이 없어요.' }, { status: 403 });

    await prisma.schedule.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /schedules/:id]', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

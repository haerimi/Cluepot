import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['accepted', 'declined'] as const;
type RsvpStatus = typeof ALLOWED_STATUSES[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { id: scheduleId } = await params;
    const body = await req.json();
    const status: RsvpStatus = body.status;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태예요. accepted 또는 declined만 허용됩니다.' }, { status: 400 });
    }

    const member = await prisma.scheduleMember.findUnique({
      where: { scheduleId_userId: { scheduleId, userId: user.id } },
    });

    if (!member) {
      return NextResponse.json({ error: '이 일정의 참가자가 아니에요.' }, { status: 403 });
    }

    const updated = await prisma.scheduleMember.update({
      where: { id: member.id },
      data: { status },
    });

    return NextResponse.json({ status: updated.status });
  } catch (e) {
    console.error('[PATCH /schedules/:id/rsvp]', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

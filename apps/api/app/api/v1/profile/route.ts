import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { nickname, profileImage } = await req.json();
    if (!nickname?.trim()) {
      return NextResponse.json({ error: '닉네임을 입력해주세요.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        nickname: nickname.trim(),
        ...(profileImage !== undefined && { profileImage }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req);
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nickname: true,
        email: true,
        profileImage: true,
      }
    })

    if (!profile) return NextResponse.json({ error: '유저 없음' }, { status: 404 });
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobile-auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getMobileUser(req);
        if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

        const { email, nickname } = await req.json();
        if (!email || !nickname) {
            return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
        }

        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: { id: user.id, email, nickname },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}
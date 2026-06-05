import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser(token);
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
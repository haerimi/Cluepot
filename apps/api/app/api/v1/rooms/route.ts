import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// 방 목록
export async function GET(req: NextRequest) {
    try {
        const user = await getMobileUser(req);
        if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

        const room = await prisma.participant.findMany({
            where: { userId: user.id, leftAt: null },
            select: {
                id: true,
                isHost: true,
                room: {
                    select: {
                        roomCode: true,
                        name: true,
                        category: true,
                        status: true,
                        schedule: {
                            select: {
                                id: true,
                                scheduledAt: true,
                                placeName: true,
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(room);
    } catch {
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

// 방 생성
export async function POST(req: NextRequest) {
    try {
        const user = await getMobileUser(req);
        if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

        const { name, category } = await req.json();
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const room = await prisma.room.create({
            data: {
                roomCode,
                name,
                category,
                status: 'waiting',
                participants: {
                    create: {
                        userId: user.id,
                        isHost: true,
                        abstractLocation: '',
                        lat: 0,
                        lng: 0
                    },
                }
            }
        })
        return NextResponse.json(room);
    } catch {
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}
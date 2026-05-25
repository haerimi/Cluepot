"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/util/supabase/server";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(
    category: string,
    name: string
): Promise<{ roomCode: string; roomId: string }> {
    const roomCode = generateCode();

    const room = await prisma.room.create({
        data: {
            roomCode,
            category,
            name
        },
    });

    return { roomCode: room.roomCode, roomId: room.id };
}

export async function validateRoom(
    roomCode: string
): Promise<{ valid: boolean; reason?: string; expiresAt?: string}> {
    const room = await prisma.room.findUnique({
        where: { roomCode }
    })

    if (!room)
        return { valid: false, reason: "존재하지 않는 모임 코드예요." }
    if (room.linkExpiresAt < new Date())
        return { valid: false, reason: "만료된 모임이에요." }

    return { valid: true, expiresAt: room.linkExpiresAt.toISOString() }
}

export async function leaveRoom(roomCode: string): Promise<void> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const userId = user.id;

    const participant = await prisma.participant.findUnique({
        where: { roomCode_userId: { roomCode, userId } }
    });
    if (!participant) return;

    if (participant.isHost) {
        // 호스트면 방 전체 삭제 (cascade로 participants도 삭제됨)
        await prisma.room.delete({ where: { roomCode } });
    } else {
        // 참가자면 퇴장 처리
        await prisma.participant.update({
            where: { roomCode_userId: { roomCode, userId } },
            data: { leftAt: new Date() }
        });
    }
}

export async function getMyRooms() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // userId 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const userId = user.id;

    return await prisma.participant.findMany({
        where: { userId: userId, leftAt: null },
        include: { room: true },
    })
}
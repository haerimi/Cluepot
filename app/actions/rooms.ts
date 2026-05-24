"use server";

import { prisma } from "@/lib/prisma";

function generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(
    category: string,
): Promise<{ roomCode: string; roomId: string }> {
    const roomCode = generateCode();

    const room = await prisma.room.create({
        data: {
            roomCode,
            category,
        },
    });

    return { roomCode: room.roomCode, roomId: room.id };
}

export async function validateRoom(
    roomCode: string
): Promise<{ valid: boolean; reason?: string }> {
    const room = await prisma.room.findUnique({
        where: { roomCode }
    })

    if (!room)
        return { valid: false, reason: "존재하지 않는 모임 코드예요." }
    if (room.linkExpiresAt < new Date())
        return { valid: false, reason: "만료된 모임이에요." }

    return { valid: true }
}

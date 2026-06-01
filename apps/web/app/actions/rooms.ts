"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createRoom(
  category: string,
  name: string,
): Promise<{ roomCode: string; roomId: string }> {
  const roomCode = generateCode();

  const room = await prisma.room.create({
    data: {
      roomCode,
      category,
      name,
      linkExpiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
    },
  });

  return { roomCode: room.roomCode, roomId: room.id };
}

export async function validateRoom(
  roomCode: string,
): Promise<{ valid: boolean; reason?: string; expiresAt?: string }> {
  const room = await prisma.room.findUnique({
    where: { roomCode },
  });

  if (!room) return { valid: false, reason: "존재하지 않는 모임 코드예요." };
  if (room.linkExpiresAt < new Date())
    return { valid: false, reason: "만료된 초대코드예요." };

  return { valid: true, expiresAt: room.linkExpiresAt.toISOString() };
}

/** 기존 멤버의 방 접속 유효성 확인 — 초대코드 만료와 무관하게 방이 존재하면 true */
export async function checkRoomExists(
  roomCode: string,
): Promise<{ exists: boolean }> {
  const room = await prisma.room.findUnique({
    where: { roomCode },
    select: { roomCode: true },
  });

  return { exists: Boolean(room) };
}

export async function leaveRoom(roomCode: string): Promise<void> {
  const userId = await getCurrentUserId();

  const participant = await prisma.participant.findUnique({
    where: { roomCode_userId: { roomCode, userId } },
  });
  if (!participant) return;

  if (participant.isHost) {
    // 호스트면 방 전체 삭제 (cascade로 participants도 삭제됨)
    await prisma.room.delete({ where: { roomCode } });
  } else {
    // 참가자면 퇴장 처리
    await prisma.participant.update({
      where: { roomCode_userId: { roomCode, userId } },
      data: { leftAt: new Date() },
    });

    // ScheduleMember 삭제 -> 캘린더에서 제외 
    const schedule = await prisma.schedule.findUnique({
      where: { roomCode }
    })

    if (schedule) {
      await prisma.scheduleMember.deleteMany({
        where: { scheduleId: schedule.id, userId },
      })
    }
  }

  revalidatePath("/rooms");
  revalidatePath("/calendar");
}

export async function getMyRooms() {
  const userId = await getCurrentUserId();

  return await prisma.participant.findMany({
    where: { userId: userId, leftAt: null },
    include: {
      room: {
        include: {
          schedule: { select: { id: true } }
        }
      }
    },
  });
}

export async function extendRoomLink(roomCode: string, isHost: boolean) {
  if (!isHost) {
    return;
  }

  return await prisma.room.update({
    where: { roomCode },
    data: {
      linkExpiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
    }
  })
}
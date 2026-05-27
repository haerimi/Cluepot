"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/util/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function supabaseCreateClient() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  return supabase;
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
      linkExpiresAt: new Date(Date.now() + 5 * 1000), // 🧪 테스트용 5초
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
    return { valid: false, reason: "만료된 모임이에요." };

  return { valid: true, expiresAt: room.linkExpiresAt.toISOString() };
}

export async function leaveRoom(roomCode: string): Promise<void> {
  const supabase = await supabaseCreateClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userId = user.id;

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

    if(schedule) {
        await prisma.scheduleMember.deleteMany({
            where: { scheduleId: schedule.id, userId },
        })
    }
  }

  revalidatePath("/rooms");
  revalidatePath("/calendar");
}

export async function getMyRooms() {
  const supabase = await supabaseCreateClient();

  // userId 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userId = user.id;

  return await prisma.participant.findMany({
    where: { userId: userId, leftAt: null },
    include: { room: {
        include: { schedule: true }
    } },
  });
}

export async function extendRoomLink(roomCode: string, isHost: boolean) {
    if(!isHost) {
        return;
    }   

    return await prisma.room.update({
        where: { roomCode },
        data: {
            linkExpiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
        }
    })
}
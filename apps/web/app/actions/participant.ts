"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import {
  AtmospherePreference,
  DistanceTolerance,
  Transport,
} from "@/types/participant";
import type { Participant } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

export async function joinRoom(roomCode: string): Promise<{
  participantId: string;
  isHost: boolean;
  linkExpiresAt: string;
  category: string;
  roomStatus: string;
  savedPreference: {
    abstractLocation: string;
    transports: string[];
    distanceTolerance: string | null;
    atmospherePreference: string | null;
    lng: number;
    lat: number;
  } | null;
}> {
  const userId = await getCurrentUserId();

  const participant = await prisma.$transaction(async (tx) => {
    const count = await tx.participant.count({ where: { roomCode } });

    return tx.participant.upsert({
      where: { roomCode_userId: { roomCode, userId } },
      update: { leftAt: null },
      create: {
        roomCode,
        userId,
        isHost: count === 0,
        abstractLocation: "",
        lat: 0,
        lng: 0,
      },
      include: {
        room: { select: { linkExpiresAt: true, category: true, status: true } },
      },
    });
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  }
);

  // isHost는 DB 컬럼을 기준으로 반환 (새로고침해도 정확함)
  // savedPreference는 기존에 저장한 선호가 있으면 반환 (새로고침 시 복원용)
  const hasSaved = participant.abstractLocation !== "";
  return {
    participantId: participant.id,
    isHost: participant.isHost,
    linkExpiresAt: participant.room.linkExpiresAt.toISOString(),
    category: participant.room.category,
    roomStatus: participant.room.status,
    savedPreference: hasSaved
      ? {
        abstractLocation: participant.abstractLocation,
        transports: participant.transports,
        distanceTolerance: participant.distanceTolerance,
        atmospherePreference: participant.atmospherePreference,
        lat: participant.lat,
        lng: participant.lng,
      }
      : null,
  };
}

type SavePreferenceParams = {
  roomCode: string;
  lat: number;
  lng: number;
  abstractLocation: string;
  transports: Transport[];
  distanceTolerance?: DistanceTolerance;
  atmospherePreference?: AtmospherePreference;
};

type SavePreferenceResult = { ok: true } | { ok: false; reason: string };

export async function savePreference(
  params: SavePreferenceParams,
): Promise<SavePreferenceResult> {
  const { roomCode, ...data } = params;

  const userId = await getCurrentUserId();

  const participant = await prisma.participant.findUnique({
    where: { roomCode_userId: { roomCode, userId } },
  });
  if (!participant || participant.leftAt !== null) {
    return {
      ok: false,
      reason: "이미 방에서 나간 상태라 선호를 저장할 수 없어요.",
    };
  }

  await prisma.participant.update({
    where: { roomCode_userId: { roomCode, userId } },
    data: data,
  });

  return { ok: true };
}

export async function getParticipants(roomCode: string): Promise<{
  participants: (Participant & {
    user: { nickname: string; profileImage: string | null };
  })[];
}> {
  const userId = await getCurrentUserId();

  const self = await prisma.participant.findUnique({
    where: { roomCode_userId: { roomCode, userId } },
  });
  if (!self || self.leftAt !== null) {
    throw new Error("이 방의 참가자가 아닙니다.");
  }

  const participants = await prisma.participant.findMany({
    where: {
      roomCode,
      leftAt: null, // 퇴장하지 않은 참가자만
    },
    include: {
      user: {
        select: { nickname: true, profileImage: true }, // 필요한 필드 가져오기
      },
    },
  });

  return { participants };
}

export async function saveAvailableDates(roomCode: string, dates: string[]) {
  const userId = await getCurrentUserId();

  const participant = await prisma.participant.findUnique({
    where: { roomCode_userId: { roomCode, userId } },
  });
  if (!participant || participant.leftAt !== null) {
    return {
      ok: false,
      reason: "이미 방에서 나간 상태라 선호를 저장할 수 없어요.",
    };
  }

  if (dates.length > 5) {
    return { ok: false, reason: '날짜는 최대 5개까지 선택할 수 있어요.' };
  }

  // 기존 날짜 삭제 후 새로 저장 (replace 방식)
  await prisma.$transaction([
    prisma.availableDate.deleteMany({
      where: { roomCode, userId }
    }),
    prisma.availableDate.createMany({
      data: dates.map((date) => ({
        roomCode, userId, date: new Date(date)
      }))
    })
  ])

  return { ok: true }
}

export async function getAvailableDates(roomCode: string) {
  const userId = await getCurrentUserId();

  const rows = await prisma.availableDate.findMany({
    where: { roomCode, userId },
    orderBy: { date: 'asc' }
  })

  return rows.map((r) => r.date.toISOString().slice(0, 10))
}

export async function getRecommendedDates(roomCode: string) {
  const userId = await getCurrentUserId();

  const user = await prisma.participant.findUnique({
    where: { roomCode_userId: { roomCode, userId } }
  })

  if (!user || user.leftAt !== null) throw new Error("이 방의 참가자가 아닙니다.")

  const rows = await prisma.availableDate.findMany({
    where: { roomCode }
  })

  // 날짜별로 userId 그룹핑
  const map = new Map<string, string[]>()
  for (const row of rows) {
    const key = row.date.toISOString().slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row.userId)
  }

  // 전체 활성 참가자 수
  const total = await prisma.participant.count({
    where: { roomCode, leftAt: null }
  })

  // 인원 많은 순 정렬
  return Array.from(map.entries())
    .map(([date, userIds]) => ({ date, count: userIds.length, total, userIds }))
    .sort((a, b) => b.count - a.count)
}

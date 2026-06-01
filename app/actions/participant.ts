"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import {
  AtmospherePreference,
  DistanceTolerance,
  Transport,
} from "@/types/participant";
import type { Participant } from "@/generated/prisma/client";

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
  });

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

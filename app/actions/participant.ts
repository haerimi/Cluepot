"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/util/supabase/server";
import { prisma } from "@/lib/prisma";
import { AtmospherePreference, DistanceTolerance, Transport } from "@/types/participant";
import type { Participant } from "@/lib/generated/prisma/client";

export async function joinRoom(roomCode: string)
    : Promise<{
        participantId: string;
        isHost: boolean;
        savedPreference: {
            abstractLocation: string;
            transports: string[];
            distanceTolerance: string | null;
            atmospherePreference: string | null;
        } | null;
    }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // userId 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const userId = user.id;

    // 방 코드를 가진 participant 행 집계
    // 0 이면 아직 아무도 없음 -> 첫번째 입장자 = host
    const count = await prisma.participant.count({
        where: { roomCode }
    })
    const isHostForCreate = count === 0;

    const participant = await prisma.participant.upsert({
        where: {
            roomCode_userId: { roomCode, userId }
        },
        update: {},
        create: {
            roomCode,
            userId,
            isHost: isHostForCreate,
            abstractLocation: "",
            lat: 0,
            lng: 0
        }
    })

    // isHost는 DB 컬럼을 기준으로 반환 (새로고침해도 정확함)
    // savedPreference는 기존에 저장한 선호가 있으면 반환 (새로고침 시 복원용)
    const hasSaved = participant.abstractLocation !== "";
    return {
        participantId: participant.id,
        isHost: participant.isHost,
        savedPreference: hasSaved
            ? {
                abstractLocation: participant.abstractLocation,
                transports: participant.transports,
                distanceTolerance: participant.distanceTolerance,
                atmospherePreference: participant.atmospherePreference,
            }
            : null
    }
}

type SavePreferenceParams = {
    roomCode: string,
    lat: number,
    lng: number,
    abstractLocation: string,
    transports: Transport[],
    distanceTolerance?: DistanceTolerance,
    atmospherePreference?: AtmospherePreference
}

export async function savePreference(params: SavePreferenceParams) {
    const { roomCode, ...data } = params

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // userId 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const userId = user.id;

    await prisma.participant.update({
        where: { roomCode_userId: { roomCode, userId } },
        data: data
    })
}

export async function getParticipants(roomCode: string)
    : Promise<{
        participants: (
            Participant & { user: { nickname: string; profileImage: string | null } }
        )[]
    }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // userId 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const participants = await prisma.participant.findMany({
        where: {
            roomCode,
            leftAt: null // 퇴장하지 않은 참가자만
        },
        include: {
            user: {
                select: { nickname: true, profileImage: true } // 필요한 필드 가져오기
            }
        }
    })

    return { participants }
}
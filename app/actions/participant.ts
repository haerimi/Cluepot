"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/util/supabase/server";
import { prisma } from "@/lib/prisma";
import { AtmospherePreference, DistanceTolerance, Transport } from "@/types/participant";
import { Participant } from "@prisma/client";

export async function joinRoom(roomCode: string)
    : Promise<{ participantId: string; isHost: boolean }> {
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
    const isHost = count === 0;

    const participant = await prisma.participant.upsert({
        where: {
            roomCode_userId: { roomCode, userId }
        },
        update: {},
        create: {
            roomCode,
            userId,
            isHost,
            abstractLocation: "",
            lat: 0,
            lng: 0
        }
    })

    return { participantId: participant.id, isHost }
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
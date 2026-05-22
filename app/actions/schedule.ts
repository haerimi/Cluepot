"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/util/supabase/server";
import { prisma } from "@/lib/prisma";

/* ── Auth helper ─────────────────────────────────────────────────────────── */

async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

/* ── Create ──────────────────────────────────────────────────────────────── */

export interface CreateScheduleInput {
  roomCode: string;
  category?: string;
  title: string;
  placeName: string;
  placeAddress: string;
  lat: number;
  lng: number;
  /** ISO date-time string, e.g. "2026-06-16T15:00" */
  scheduledAt: string;
  memo?: string;
}

export async function createSchedule(
  input: CreateScheduleInput,
): Promise<{ id: string }> {
  const userId = await getCurrentUserId();

  // Ensure the room row exists so the FK is satisfied. Rooms created
  // client-side (mock flow) may not yet be in the DB.
  await prisma.room.upsert({
    where: { roomCode: input.roomCode },
    update: {},
    create: {
      roomCode: input.roomCode,
      category: input.category ?? "restaurant",
      status: "done",
    },
  });

  // Collect participant user IDs. In the mock flow the list is empty, so we
  // fall back to just the creator.
  const participants = await prisma.participant.findMany({
    where: { roomCode: input.roomCode },
    select: { userId: true },
  });

  const memberIds = new Set<string>(participants.map((p) => p.userId));
  memberIds.add(userId);

  const schedule = await prisma.schedule.create({
    data: {
      roomCode: input.roomCode,
      title: input.title,
      placeName: input.placeName,
      placeAddress: input.placeAddress,
      lat: input.lat,
      lng: input.lng,
      scheduledAt: new Date(input.scheduledAt),
      memo: input.memo ?? null,
      createdBy: userId,
      members: {
        create: Array.from(memberIds).map((uid) => ({
          userId: uid,
          status: uid === userId ? "accepted" : "pending",
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/calendar");
  return { id: schedule.id };
}

/* ── Read ────────────────────────────────────────────────────────────────── */

export type ScheduleListItem = {
  id: string;
  title: string;
  placeName: string;
  placeAddress: string;
  scheduledAt: string; // ISO string — safe for client props
  createdBy: string | null;
  memberCount: number;
  myStatus: string;
};

export async function getMySchedules(): Promise<ScheduleListItem[]> {
  const userId = await getCurrentUserId();

  const rows = await prisma.schedule.findMany({
    where: { members: { some: { userId } } },
    include: { members: { select: { userId: true, status: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    placeName: s.placeName,
    placeAddress: s.placeAddress,
    scheduledAt: s.scheduledAt.toISOString(),
    createdBy: s.createdBy,
    memberCount: s.members.length,
    myStatus: s.members.find((m) => m.userId === userId)?.status ?? "pending",
  }));
}

export type ScheduleDetail = {
  id: string;
  title: string;
  placeName: string;
  placeAddress: string;
  lat: number;
  lng: number;
  scheduledAt: string;
  memo: string | null;
  createdBy: string | null;
  createdAt: string;
  members: {
    id: string;
    userId: string;
    status: string;
    nickname: string;
    profileImage: string | null;
  }[];
  currentUserId: string;
};

export async function getScheduleById(
  scheduleId: string,
): Promise<ScheduleDetail | null> {
  const userId = await getCurrentUserId();

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      members: {
        include: { user: { select: { id: true, nickname: true, profileImage: true } } },
      },
    },
  });

  if (!schedule) return null;

  const isMember = schedule.members.some((m) => m.userId === userId);
  if (!isMember) return null;

  return {
    id: schedule.id,
    title: schedule.title,
    placeName: schedule.placeName,
    placeAddress: schedule.placeAddress,
    lat: schedule.lat,
    lng: schedule.lng,
    scheduledAt: schedule.scheduledAt.toISOString(),
    memo: schedule.memo,
    createdBy: schedule.createdBy,
    createdAt: schedule.createdAt.toISOString(),
    members: schedule.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      status: m.status,
      nickname: m.user.nickname,
      profileImage: m.user.profileImage,
    })),
    currentUserId: userId,
  };
}

/* ── Update ──────────────────────────────────────────────────────────────── */

export interface UpdateScheduleInput {
  title?: string;
  scheduledAt?: string;
  memo?: string | null;
}

export async function updateSchedule(
  scheduleId: string,
  input: UpdateScheduleInput,
): Promise<void> {
  const userId = await getCurrentUserId();

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { createdBy: true },
  });

  if (!schedule || schedule.createdBy !== userId) {
    throw new Error("권한이 없어요");
  }

  await prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.scheduledAt !== undefined && {
        scheduledAt: new Date(input.scheduledAt),
      }),
      ...(input.memo !== undefined && { memo: input.memo }),
    },
  });

  revalidatePath(`/calendar/${scheduleId}`);
  revalidatePath("/calendar");
}

/* ── Delete ──────────────────────────────────────────────────────────────── */

export async function deleteSchedule(scheduleId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    select: { createdBy: true },
  });

  if (!schedule || schedule.createdBy !== userId) {
    throw new Error("권한이 없어요");
  }

  await prisma.schedule.delete({ where: { id: scheduleId } });

  revalidatePath("/calendar");
}

/* ── Attendance ──────────────────────────────────────────────────────────── */

export async function updateMemberStatus(
  scheduleId: string,
  status: "accepted" | "declined" | "pending",
): Promise<void> {
  const userId = await getCurrentUserId();

  await prisma.scheduleMember.update({
    where: { scheduleId_userId: { scheduleId, userId } },
    data: { status },
  });

  revalidatePath(`/calendar/${scheduleId}`);
}

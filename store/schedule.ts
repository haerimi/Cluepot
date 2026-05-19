import { create } from "zustand";

interface ScheduleInfo {
  scheduleId: string;
  roomCode: string;
  title: string;
  placeName: string;
  placeAddress: string;
  lat: number;
  lng: number;
  scheduledAt: string; // Date 대신 string (room.ts의 linkExpiresAt 패턴 참고)
  memo: string;
}

interface ScheduleState {
  scheduleInfo: ScheduleInfo | null;
}

interface ScheduleActions {
  setSchedule: (schedule: ScheduleInfo) => void; // 일정 확정 시
  clearSchedule: () => void; // 방 나갈 때
}

const initialState: ScheduleState = {
  scheduleInfo: null,
}

export const useScheduleStore = create<ScheduleState & ScheduleActions>((set) => ({
  ...initialState,
  setSchedule: (scheduleInfo) => set({ scheduleInfo }),
  clearSchedule: () => set(initialState)
}))
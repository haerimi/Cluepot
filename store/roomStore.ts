import { create } from 'zustand'

export type Category = 'restaurant' | 'cafe' | 'bar' | 'brunch' | 'dessert'
export type TransportMode = 'walk' | 'transit' | 'car'

interface Participant {
  id: string
  nickname: string
  abstractLocation: string  // '홍대입구역 근처' | '연남동'
  lat: number
  lng: number
  transport: TransportMode | null
}

interface RoomState {
  // 방 정보
  roomCode: string | null
  category: Category | null
  status: 'waiting' | 'ready' | 'done'

  // 참여자
  myId: string | null
  participants: Participant[]

  // 결과
  midpointLat: number | null
  midpointLng: number | null
  nearestStation: string | null

  // Actions
  setCategory: (category: Category) => void
  setRoomCode: (code: string) => void
  setMyId: (id: string) => void
  addParticipant: (p: Participant) => void
  updateParticipant: (id: string, data: Partial<Participant>) => void
  setMidpoint: (lat: number, lng: number, station: string) => void
  reset: () => void
}

const initialState = {
  roomCode: null,
  category: null,
  status: 'waiting' as const,
  myId: null,
  participants: [],
  midpointLat: null,
  midpointLng: null,
  nearestStation: null,
}

export const useRoomStore = create<RoomState>((set) => ({
  ...initialState,

  setCategory: (category) => set({ category }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setMyId: (myId) => set({ myId }),

  addParticipant: (p) =>
    set((state) => ({ participants: [...state.participants, p] })),

  updateParticipant: (id, data) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  setMidpoint: (midpointLat, midpointLng, nearestStation) =>
    set({ midpointLat, midpointLng, nearestStation }),

  reset: () => set(initialState),
}))
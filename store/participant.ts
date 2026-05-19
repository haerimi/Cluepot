import { create } from "zustand";
import { Transport } from "@/types/participant";

// state
interface Participant {
  ppId: string;
  ppUserId: string;
  ppAbstractLocation: string;
  ppLat: number;
  ppLng: number;
  ppTransport: Transport | null;
  ppIsHost: boolean;
}

interface ParticipantState {
  participants: Participant[];
}

// action
interface ParticipantActions {
  addParticipant: (participant: Participant) => void;
  updateParticipant: (participant: Participant) => void;
  removeParticipant: (ppId: string) => void;  // 특정 1명만 삭제 (누군가 방에서 나갔을 때)
  clearParticipant: () => void; // 나가기
}

// 초기값
const initialState: ParticipantState = {
  participants: [],
};

export const useParticipantStore = create<
  ParticipantState & ParticipantActions
>((set) => ({
  ...initialState,
  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),
  updateParticipant: (participant) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.ppId === participant.ppId ? participant : p,
      ),
    })),
    removeParticipant: (ppId) => set((state) => ({
      participants: state.participants.filter((p) => p.ppId !== ppId)
    })),
  clearParticipant: () => set(initialState),
}));

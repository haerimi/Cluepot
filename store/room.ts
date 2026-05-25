import { create } from "zustand";
import { Category, RoomStatus } from "@/types/room";

// state
interface RoomInfo {
  roomId: string;
  roomCode: string;
  roomCategory: Category;
  roomStatus: RoomStatus;
  linkExpiresAt: string; // 링크 만료 카운트다운용

}
interface RoomState {
  roomInfo: RoomInfo | null;
  activeRooms: string[];
}

// action
interface RoomActions {
  setRoom: (room: RoomInfo) => void;
  setRoomStatus: (status: RoomStatus) => void; // 상태만 업데이트
  setRoomCategory: (roomCategory: Category) => void; // 카테고리만 업데이트
  addActiveRoom: (code: string) => void;
  removeActiveRoom: (code: string) => void;
  clearRoom: () => void; // 나가기
}

// 초기값
const initialState: RoomState = {
  roomInfo: null, // 방 나가면 null ← 방의 생명주기
  activeRooms: [], // 방 나가도 유지 ← 사용자의 생명주기
};

export const useRoomStore = create<RoomState & RoomActions>((set) => ({
  ...initialState,
  setRoom: (roomInfo) => set({ roomInfo }),
  setRoomStatus: (status) =>
    set((state) => ({
      roomInfo: state.roomInfo
        ? { ...state.roomInfo, roomStatus: status }
        : null,
    })),

  /** 기존 roomInfo가 있을 때만 기존 데이터를 복사(...state.roomInfo)하고
     roomCategory만 쏙 바꾸도록 삼항 연산자 사용 **/
  setRoomCategory: (roomCategory) =>
    set((state) => ({
      roomInfo: state.roomInfo ? { ...state.roomInfo, roomCategory } : null,
    })),
  addActiveRoom: (roomCode) => 
    set((state) => ({
      activeRooms: state.activeRooms.includes(roomCode)
      ? state.activeRooms
      : [...state.activeRooms, roomCode]
    })),
  removeActiveRoom: (roomCode) => 
    set((state) => ({
      activeRooms: state.activeRooms.filter((c) => c !== roomCode)
    })),
  clearRoom: () => set(initialState),
}));

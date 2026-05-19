import { create } from "zustand";
import { Category } from "@/types/room";

interface Place {
  placeId: string;
  placeName: string;
  placeAddress: string;
  lat: number;
  lng: number;
  category: Category;
}

interface MidPoint {
  lat: number;
  lng: number;
}

interface MapState {
  places: Place[]; // 추천 장소 목록
  midPoint: MidPoint | null; // 참가자들의 중간지점
  selectedPlace: Place | null; // 투표/선택된 장소
}

interface MapActions {
  setPlaces: (places: Place[]) => void; // 추천 장소 목록 세팅
  setMidPoint: (midPoint: MidPoint) => void; // 중간지점 계산 후 세팅
  selectPlace: (place: Place) => void; // 장소 선택
  clearMap: () => void; // 방 나갈 때
}

const initialState: MapState = {
  places: [],
  midPoint: null,
  selectedPlace: null,
};

export const useMapStore = create<MapState & MapActions>((set) => ({
  ...initialState,
  setPlaces: (places) => set({ places }),
  setMidPoint: (midPoint) =>
    set({
      midPoint: {
        lat: midPoint.lat,
        lng: midPoint.lng,
      },
    }),
  selectPlace: (place) => set({ selectedPlace: place }),
  clearMap: () => set(initialState),
}));

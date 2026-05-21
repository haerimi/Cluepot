import { create } from "zustand";
import { Category } from "@/types/room";
import { RecommendedPlace } from "@/types/recommendation";

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
  recommendedPlaces: RecommendedPlace[];
  midPoint: MidPoint | null; // 참가자들의 중간지점
  selectedPlace: RecommendedPlace; // 투표/선택된 장소
}

interface MapActions {
  setPlaces: (places: RecommendedPlace[]) => void; // 추천 장소 목록 세팅
  setMidPoint: (midPoint: MidPoint) => void; // 중간지점 계산 후 세팅
  selectPlace: (place: RecommendedPlace) => void; // 장소 선택
  clearMap: () => void; // 방 나갈 때
}

const initialState: MapState = {
  places: [],
  recommendedPlaces: [],
  midPoint: null,
  selectedPlace: {
    placeId: "",
    placeName: "",
    placeAddress: "",
    category: "restaurant",
    lat: 0,
    lng: 0,
    fairnessScore: 0,
    balanceTag: "most_balanced",
    reasoning: "",
    perParticipantTime: [],
    atmosphereMatch: "",
    reviewIntelligence: {
      authenticCount: 0,
      pros: [],
      cons: [],
    },
  }
};

export const useMapStore = create<MapState & MapActions>((set) => ({
  ...initialState,
  setPlaces: (places) => set({ recommendedPlaces: places }),
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

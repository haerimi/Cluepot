import { create } from "zustand";

interface UserInfo {
  myId: string;
  myEmail: string;
  myNickname: string;
  myProfileImage: string;
}

interface UserState {
  userInfo: UserInfo | null;
  /** True between app mount and the first AuthHydrator useEffect run. */
  isAuthLoading: boolean;
}

interface UserActions {
  setMy: (user: UserInfo) => void;
  clearMy: () => void;
  setAuthLoading: (loading: boolean) => void;
}

const initialState: UserState = {
  userInfo: null,
  isAuthLoading: true,
};

export const useUserStore = create<UserState & UserActions>((set) => ({
  ...initialState,
  setMy: (userInfo) => set({ userInfo, isAuthLoading: false }),
  clearMy: () => set({ userInfo: null, isAuthLoading: false }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
}));

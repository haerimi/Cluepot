import { create } from "zustand";

// state
interface UserInfo {
  myId: string;
  myEmail: string;
  myNickname: string;
  myProfileImage: string;
}
interface UserState {
  userInfo: UserInfo | null;
}

// action
interface UserActions {
  setMy: (user: UserInfo) => void;
  clearMy: () => void; // 로그아웃
}

// 초기값
const initialState: UserState = {
  userInfo: null,
};

export const useUserStore = create<UserState & UserActions>((set) => ({
  ...initialState,
  setMy: (userInfo) => set({ userInfo }),
  clearMy: () => set(initialState),
}));

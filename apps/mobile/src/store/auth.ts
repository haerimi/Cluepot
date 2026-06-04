import { create } from 'zustand';

type User = {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
};

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

// TODO: 필요한 상태 추가 (예: 로딩 상태 등)
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

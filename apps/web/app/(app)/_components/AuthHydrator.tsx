"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user";

export interface HydratedUser {
  id: string;
  email: string;
  nickname: string;
  profileImage: string;
}

/**
 * Invisible client component that bridges the server-read Supabase user
 * into the Zustand user store so that any client component can read auth
 * state without an extra round-trip fetch.
 *
 * Rendered once inside AppLayout — the null return means it adds zero DOM.
 */
export function AuthHydrator({ user }: { user: HydratedUser | null }) {
  const setMy = useUserStore((s) => s.setMy);
  const clearMy = useUserStore((s) => s.clearMy);

  useEffect(() => {
    if (user) {
      setMy({
        myId: user.id,
        myEmail: user.email,
        myNickname: user.nickname,
        myProfileImage: user.profileImage,
      });
    } else {
      clearMy();
    }
  }, [user, setMy, clearMy]);

  return null;
}

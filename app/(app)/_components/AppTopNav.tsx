"use client";

import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { HydratedUser } from "./AuthHydrator";

/**
 * Mobile / tablet top navigation bar.
 * Hidden on desktop (lg+) — the sidebar takes over there.
 *
 * Shows the brand mark on the left and either:
 *   - a user initial pill + logout button (authenticated)
 *   - a login link (unauthenticated)
 */
export function AppTopNav({ user }: { user: HydratedUser | null }) {
  const displayName = user?.nickname || user?.email?.split("@")[0] || "";
  const initial = displayName[0]?.toUpperCase() ?? "?";

  return (
    <header
      className="lg:hidden flex items-center justify-between px-5 shrink-0"
      style={{
        height: "52px",
        background: "rgba(250,249,246,0.96)",
        borderBottom: "1px solid #E5E1D9",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Brand */}
      <Link
        href="/"
        className="text-[16px] font-black text-[#1C1A17] tracking-tight hover:opacity-70 transition-opacity"
      >
        Meet<span className="text-[#7C5CFC]">Spot</span>
      </Link>

      {user ? (
        <div className="flex items-center gap-2.5">
          <Link href="/rooms" className="text-[12px] font-medium text-ink-muted hover:text-ink transition-colors">
            내 모임
          </Link>

          {/* User initial badge */}
          <div className="w-7 h-7 rounded-full bg-[#7C5CFC] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white leading-none ">
              {initial}
            </span>
          </div>

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              className="h-7 px-3 text-[11px] font-medium text-[#908D87] border border-[#E5E1D9] rounded-full hover:text-[#1C1A17] hover:border-[#D0CCC4] transition-colors cursor-pointer"
            >
              로그아웃
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="h-7 px-3 text-[12px] font-medium text-[#1C1A17] border border-[#E5E1D9] rounded-full hover:border-[#D0CCC4] transition-colors inline-flex items-center"
        >
          로그인
        </Link>
      )}
    </header>
  );
}

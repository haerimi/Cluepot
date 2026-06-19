"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { HydratedUser } from "./AuthHydrator";

/**
 * Mobile / tablet top navigation bar.
 * Hidden on desktop (lg+) — the sidebar takes over there.
 *
 * Shows the brand mark on the left and a hamburger button on the right.
 * Tapping the hamburger slides in a right-side drawer with all nav items,
 * matching the desktop sidebar's link set so mobile users can reach every
 * page without needing the sidebar.
 */
interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ReactNode;
}

export function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M1 6.5L6.5 1L12 6.5V12H8.5V8.5H4.5V12H1V6.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M1 6.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1" y="2.5" width="11" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 5.5H12" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 1V3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 1V3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function RoomsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="7.5" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 12C1 9.79 3.52 8 6.5 8C9.48 8 12 9.79 12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 2H2.5C1.95 2 1.5 2.45 1.5 3V11C1.5 11.55 1.95 12 2.5 12H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 4.5L12.5 7L9.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function JoinCodeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      {/* # 가로선 */}
      <path d="M1.5 4.5H11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M1.5 8.5H11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {/* # 세로선 — 위아래로 살짝 기울어져 코드 느낌 */}
      <path d="M4.5 2L3.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 2L8.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function AppTopNav({ user }: Readonly<{ user: HydratedUser | null }>) {
  const displayName = user?.nickname || user?.email?.split("@")[0] || "";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/calendar", label: "내 일정", icon: <CalendarIcon /> },
    { href: "/rooms", label: "내 모임", icon: <RoomsIcon /> },
    { href: "/rooms/create", label: "일정 만들기", icon: <PlusIcon /> },
    { href: "/rooms/join", label: "코드로 참가", icon: <JoinCodeIcon /> },
  ];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header
        className="lg:hidden flex items-center justify-between px-5 shrink-0"
        style={{
          height: "52px",
          background: "rgba(1,1,2,0.92)",
          borderBottom: "1px solid #23252a",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        {/* Brand */}
        <Link
          href={user ? '/calendar' : '/'}
          className="text-[16px] font-black text-ink tracking-tight hover:opacity-70 transition-opacity"
        >
          Clue<span className="text-accent">Pot</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {/* User avatar — quick identity cue */}
          {user && (
            <Link
              href="/profile"
              aria-label="프로필 보기"
              className="flex items-center justify-center w-11 h-11 shrink-0"
            >
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profileImage} alt={user.nickname}
                    className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-white leading-none">
                    {(user.nickname.charAt(0) || "?").toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Hamburger — three horizontal lines */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={isMenuOpen}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg
                       hover:bg-surface-2 active:bg-hairline transition-colors"
          >
            {/* 메뉴 아이콘 */}
            <div className="flex flex-col gap-[4px]">
              <span className="block w-[18px] h-px bg-ink opacity-90 rounded-full" />
              <span className="block w-[18px] h-px bg-ink opacity-90 rounded-full" />
              <span className="block w-[18px] h-px bg-ink opacity-90 rounded-full" />
            </div>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex justify-end"
          style={{ animation: "section-fade 0.15s ease-out both" }}
        >
          {/* Backdrop — tap to close */}
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-[2px] cursor-default"
            onClick={closeMenu}
          />

          {/* Drawer panel */}
          <div
            className="relative w-[280px] h-full bg-surface shadow-xl flex flex-col"
            style={{ animation: "reveal-right 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 h-[52px] border-b border-hairline shrink-0">
              <span className="text-[16px] font-black text-ink tracking-tight">
                Clue<span className="text-accent">Pot</span>
              </span>
              <button
                onClick={closeMenu}
                aria-label="닫기"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-subtle
                           hover:text-ink hover:bg-surface-2 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
              {navItems.map((item) => {
                const isActive =
                  item.href !== "/"
                    ? pathname.startsWith(item.href)
                    : pathname === "/";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={[
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-colors",
                      isActive
                        ? "bg-accent-light text-accent font-semibold"
                        : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "shrink-0",
                        isActive ? "text-accent" : "text-ink-subtle",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User section — pinned to bottom */}
            <div className="border-t border-hairline shrink-0">
              {user ? (
                <div className="px-4 py-4 flex items-center gap-3">
                  <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 flex-1 min-w-0 group">
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0 overflow-hidden group-hover:opacity-80 transition-opacity">
                      {user.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.profileImage} alt={user.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[13px] font-bold text-white leading-none">{initial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {displayName && (
                        <p className="text-[13px] font-semibold text-ink truncate leading-tight group-hover:text-accent transition-colors">
                          {displayName}
                        </p>
                      )}
                      <p className="text-[11px] text-ink-subtle truncate leading-tight">
                        {user.email}
                      </p>
                    </div>
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      title="로그아웃"
                      className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-subtle
                                 hover:text-ink-muted hover:bg-surface-2 transition-colors"
                    >
                      <LogoutIcon />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="px-4 py-4">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center h-10 w-full rounded-xl
                               border border-hairline text-[13px] font-medium text-ink-muted
                               hover:text-ink hover:border-hairline-strong transition-colors"
                  >
                    로그인
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

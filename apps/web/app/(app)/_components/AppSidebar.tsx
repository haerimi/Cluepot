"use client";

/**
 * AppSidebar — persistent ambient shell (desktop only, lg+).
 *
 * Why client component?
 *   Reads from two Zustand stores (map + schedule) to reflect live session
 *   state. Passed as a sibling to `children` in the layout, so page content
 *   is never forced client-side by this import.
 *
 * User prop vs. Zustand:
 *   `user` is passed directly from the async Server Component layout so the
 *   correct identity shows on the very first paint — no unauthenticated flash.
 *   AuthHydrator separately populates Zustand for reactive client components.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMapStore } from "@/store/map";
import { useScheduleStore } from "@/store/schedule";
import { logout } from "@/app/actions/auth";
import type { HydratedUser } from "./AuthHydrator";
import { HomeIcon, RoomsIcon, CalendarIcon, ProfileIcon, LogoutIcon, JoinCodeIcon } from "./AppTopNav";

const AMBIENT_LINES = [
  "장소에는 이야기가 있어요",
  "모두를 위한 곳을 찾고 있어요",
  "좋은 모임은 장소에서 시작돼요",
  "균형이 좋은 만남을 만들어요",
  "신뢰할 수 있는 후기만 골라요",
] as const;

type SessionPhase = "idle" | "waiting" | "results" | "confirmed";

const ROOM_PATH_RE = /^\/rooms\/([^/]+)/i;

function derivePhase(
  scheduleConfirmed: boolean,
  hasResults: boolean,
  inRoom: boolean,
): SessionPhase {
  if (scheduleConfirmed) return "confirmed";
  if (hasResults) return "results";
  if (inRoom) return "waiting";
  return "idle";
}

export function AppSidebar({ user }: Readonly<{ user: HydratedUser | null }>) {
  const pathname = usePathname();
  const recommendedPlaces = useMapStore((s) => s.recommendedPlaces);
  const scheduleInfo = useScheduleStore((s) => s.scheduleInfo);

  const [lineIndex, setLineIndex] = useState(0);
  const [lineVisible, setLineVisible] = useState(true);

  const roomMatch = ROOM_PATH_RE.exec(pathname);
  const currentRoomCode = roomMatch?.[1]
    ? decodeURIComponent(roomMatch[1]).toUpperCase()
    : null;

  const phase = derivePhase(
    !!scheduleInfo,
    recommendedPlaces.length > 0,
    !!currentRoomCode,
  );
  useEffect(() => {
    const id = setInterval(() => {
      setLineVisible(false);
      const fadeIn = setTimeout(() => {
        setLineIndex((i) => (i + 1) % AMBIENT_LINES.length);
        setLineVisible(true);
      }, 350);
      return () => clearTimeout(fadeIn);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const phaseLabel: Record<SessionPhase, string> = {
    idle: "",
    waiting: "대기 중",
    results: "추천 완료",
    confirmed: "모임 확정됨",
  };

  const phaseDot: Record<SessionPhase, string> = {
    idle: "bg-hairline-strong",
    waiting: "bg-hairline-strong",
    results: "bg-accent",
    confirmed: "bg-success",
  };

  const phaseText: Record<SessionPhase, string> = {
    idle: "text-ink-subtle",
    waiting: "text-ink-subtle",
    results: "text-accent",
    confirmed: "text-success",
  };

  const displayName = user?.nickname || user?.email?.split("@")[0] || "";
  const initial = displayName[0]?.toUpperCase() ?? "?";

  return (
    <aside className="hidden lg:flex flex-col w-55 shrink-0 h-dvh border-r border-hairline bg-surface-2">

      {/* ── Brand ── */}
      <div className="px-6 pt-7 pb-5">
        <Link
          href="/"
          className="text-[17px] font-black text-ink tracking-tight hover:opacity-75 transition-opacity"
        >
          Clue<span className="text-accent">Pot</span>
        </Link>
      </div>

      <div className="h-px bg-hairline" />

      {/* ── Session context — visible only inside a room ── */}
      {currentRoomCode && (
        <>
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-2.5">
              현재 세션
            </p>
            <p className="font-mono text-[14px] font-bold text-ink tracking-widest mb-2">
              {currentRoomCode}
            </p>
            {phase !== "idle" && (
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${phaseDot[phase]}`}
                  style={
                    phase === "waiting"
                      ? { animation: "waiting-dot 2s ease-in-out infinite" }
                      : undefined
                  }
                />
                <span className={`text-[12px] font-medium ${phaseText[phase]}`}>
                  {phaseLabel[phase]}
                </span>
              </div>
            )}
          </div>
          <div className="h-px bg-hairline" />
        </>
      )}

      {/* ── Navigation ── */}
      <nav className="px-3 py-4 flex flex-col gap-0.5">
        <NavItem href="/rooms/create" label="일정 만들기" icon={<HomeIcon />} active={pathname.startsWith("/rooms/create")} />
        <NavItem
          href="/calendar"
          label="내 일정"
          icon={<CalendarIcon />}
          active={pathname.startsWith("/calendar")}
        />
        {user && (
          <NavItem
            href="/profile"
            label="프로필"
            icon={<ProfileIcon />}
            active={pathname.startsWith("/profile")}
          />
        )}
        <NavItem 
          href="/rooms"
          label="내 모임"
          icon={<RoomsIcon />}
          active={pathname.startsWith("/rooms")} 
          />

        <NavItem
          href="/rooms/join"
          label="코드로 참가"
          icon={<JoinCodeIcon />}
          active={pathname.startsWith("/rooms/join")} 
          />
      </nav>

      {/* ── PINI ambient text + user section — pinned to bottom ── */}
      <div className="mt-auto">
        <div className="px-6 pb-5">
          <div className="h-px bg-hairline mb-5" />
          <p className="text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-3">
            PINI
          </p>
          <p
            className="text-[12px] text-ink-subtle leading-relaxed italic"
            style={{
              opacity: lineVisible ? 1 : 0,
              transition: "opacity 0.35s ease",
            }}
          >
            {AMBIENT_LINES[lineIndex]}
          </p>
        </div>

        <div className="h-px bg-hairline" />

        {user ? (
          <div className="px-4 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <span className="text-[12px] font-bold text-white leading-none">
                {initial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {displayName && (
                <p className="text-[13px] font-semibold text-ink truncate leading-tight">
                  {displayName}
                </p>
              )}
              <p className="text-[11px] text-ink-subtle truncate leading-tight">
                {user.email}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                title="로그아웃"
                className="w-7 h-7 flex items-center justify-center rounded-md text-ink-tertiary hover:text-ink-muted hover:bg-surface-3 transition-colors cursor-pointer"
              >
                <LogoutIcon />
              </button>
            </form>
          </div>
        ) : (
          <div className="px-4 py-4">
            <a
              href="/login"
              className="flex items-center justify-center h-9 w-full rounded-lg border border-hairline text-[12px] font-medium text-ink-subtle hover:text-ink hover:border-hairline-strong transition-colors"
            >
              로그인
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function NavItem({
  href,
  label,
  icon,
  active,
}: Readonly<{
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}>) {
  const base = "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors";
  const activeClass = "bg-accent-light text-accent font-semibold";
  const idleClass = "text-ink-subtle hover:text-ink hover:bg-surface-3";

  return (
    <Link href={href} className={`${base} ${active ? activeClass : idleClass}`}>
      {icon}
      {label}
    </Link>
  );
}

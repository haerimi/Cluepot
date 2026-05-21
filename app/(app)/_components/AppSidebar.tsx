"use client";

/**
 * AppSidebar — persistent ambient shell
 *
 * Why client component?
 *   Reads from two Zustand stores (map + schedule) to reflect live session
 *   state. This component is passed as a sibling to `children` in the layout,
 *   so the page content itself is never forced client-side by this import.
 *
 * State that lives here vs. in the page:
 *   SIDEBAR reads (global Zustand):
 *     - recommendedPlaces.length  → knows if Sherlock has run
 *     - scheduleInfo              → knows if session is confirmed
 *   SIDEBAR does NOT know: participant count, preference form state,
 *   loading state — those belong in the room page's local state.
 *
 * Ambient text rotation:
 *   Five slow-cycling phrases (5 s interval, 350 ms cross-fade).
 *   Chosen for calm, non-technical tone — Sherlock as a thoughtful
 *   presence rather than a feature label.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMapStore } from "@/store/map";
import { useScheduleStore } from "@/store/schedule";

const AMBIENT_LINES = [
  "장소에는 이야기가 있어요",
  "모두를 위한 곳을 찾고 있어요",
  "좋은 모임은 장소에서 시작돼요",
  "균형이 좋은 만남을 만들어요",
  "신뢰할 수 있는 후기만 골라요",
] as const;

type SessionPhase = "idle" | "waiting" | "results" | "confirmed";

export function AppSidebar() {
  const pathname = usePathname();
  const recommendedPlaces = useMapStore((s) => s.recommendedPlaces);
  const scheduleInfo = useScheduleStore((s) => s.scheduleInfo);

  const [lineIndex, setLineIndex] = useState(0);
  const [lineVisible, setLineVisible] = useState(true);

  /* Extract room code from path if we're inside /room/[code] */
  const roomCodeMatch = pathname.match(/^\/room\/([^/]+)/i);
  const currentRoomCode = roomCodeMatch?.[1]?.toUpperCase() ?? null;

  const phase: SessionPhase = scheduleInfo
    ? "confirmed"
    : recommendedPlaces.length > 0
      ? "results"
      : currentRoomCode
        ? "waiting"
        : "idle";

  /* Slow ambient line rotation with cross-fade */
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

  const phaseDotClass: Record<SessionPhase, string> = {
    idle: "bg-[#D0CCC4]",
    waiting: "bg-[#D0CCC4]",
    results: "bg-[#7C5CFC]",
    confirmed: "bg-[#27A644]",
  };

  const phaseLabelClass: Record<SessionPhase, string> = {
    idle: "text-[#908D87]",
    waiting: "text-[#908D87]",
    results: "text-[#7C5CFC]",
    confirmed: "text-[#27A644]",
  };

  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 h-dvh border-r border-[#E5E1D9] bg-[#FAF9F6]">

      {/* ── Brand ── */}
      <div className="px-6 pt-7 pb-5">
        <Link
          href="/"
          className="text-[17px] font-black text-[#1C1A17] tracking-tight
                     hover:opacity-75 transition-opacity"
        >
          Meet<span className="text-[#7C5CFC]">Spot</span>
        </Link>
      </div>

      <div className="h-px bg-[#E5E1D9]" />

      {/* ── Session context — visible only inside a room ── */}
      {currentRoomCode && (
        <>
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold text-[#C4C1BC] tracking-[2px] uppercase mb-2.5">
              현재 세션
            </p>

            {/* Room code — monospace, prominent but not loud */}
            <p className="font-mono text-[14px] font-bold text-[#1C1A17] tracking-widest mb-2">
              {currentRoomCode}
            </p>

            {/* Phase indicator */}
            {phase !== "idle" && (
              <div className="flex items-center gap-1.5">
                <span
                  className={[
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    phaseDotClass[phase],
                  ].join(" ")}
                  style={
                    phase === "waiting"
                      ? { animation: "waiting-dot 2s ease-in-out infinite" }
                      : undefined
                  }
                />
                <span
                  className={[
                    "text-[12px] font-medium",
                    phaseLabelClass[phase],
                  ].join(" ")}
                >
                  {phaseLabel[phase]}
                </span>
              </div>
            )}
          </div>
          <div className="h-px bg-[#E5E1D9]" />
        </>
      )}

      {/* ── Minimal navigation ── */}
      <nav className="px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                     text-[13px] text-[#908D87]
                     hover:text-[#1C1A17] hover:bg-[#F0EDE7]
                     transition-colors"
        >
          {/* Home icon — inline SVG keeps bundle clean */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 6.5L6.5 1L12 6.5V12H8.5V8.5H4.5V12H1V6.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          홈
        </Link>
      </nav>

      {/* ── Sherlock ambient text — pinned to bottom ── */}
      <div className="mt-auto px-6 pb-8">
        <div className="h-px bg-[#E5E1D9] mb-5" />
        <p className="text-[10px] font-bold text-[#C4C1BC] tracking-[2px] uppercase mb-3">
          Sherlock
        </p>
        <p
          className="text-[12px] text-[#908D87] leading-relaxed italic"
          style={{
            opacity: lineVisible ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        >
          {AMBIENT_LINES[lineIndex]}
        </p>
      </div>
    </aside>
  );
}

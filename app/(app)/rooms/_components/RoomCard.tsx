"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/app/components/ui/Badge";
import { leaveRoom } from "@/app/actions/rooms";

/* ── 타입 — getMyRooms() 반환값 기준 ──────────────────────────────────── */

type RoomCardData = {
  isHost: boolean;
  room: {
    roomCode: string;
    category: string;
    status: string;
    linkExpiresAt: Date;
    name: string;
  };
};

/* ── 카테고리별 설정 ─────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<
  string,
  { label: string; emoji: string; from: string; to: string }
> = {
  restaurant: { label: "맛집",   emoji: "🍽",  from: "from-[#FFE4D6]", to: "to-[#FFAB85]" },
  cafe:       { label: "카페",   emoji: "☕",  from: "from-[#FFF3E0]", to: "to-[#FFCC80]" },
  bar:        { label: "술자리", emoji: "🍻",  from: "from-[#EDE7F6]", to: "to-[#B39DDB]" },
  brunch:     { label: "브런치", emoji: "🥞",  from: "from-[#E8F5E9]", to: "to-[#A5D6A7]" },
  dessert:    { label: "디저트", emoji: "🍰",  from: "from-[#FCE4EC]", to: "to-[#F48FB1]" },
};

const FALLBACK_CATEGORY = {
  label: "모임", emoji: "📍", from: "from-[#F0EDE7]", to: "to-[#D8D3CB]",
};

/* ── 상태별 설정 ─────────────────────────────────────────────────────── */

type StatusVariant = "warning" | "accent" | "success" | "muted";

const STATUS_CONFIG: Record<string, { label: string; variant: StatusVariant }> = {
  waiting: { label: "대기 중", variant: "warning" },
  voting:  { label: "추천 중", variant: "accent"  },
  done:    { label: "확정됨",  variant: "success" },
};

const FALLBACK_STATUS = { label: "알 수 없음", variant: "muted" as StatusVariant };

/* ── 컴포넌트 ────────────────────────────────────────────────────────── */

export function RoomCard({ data }: Readonly<{ data: RoomCardData }>) {
  const { isHost, room } = data;
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const cat    = CATEGORY_CONFIG[room.category] ?? FALLBACK_CATEGORY;
  const status = STATUS_CONFIG[room.status]     ?? FALLBACK_STATUS;

  const isExpired = new Date(room.linkExpiresAt) < new Date();

  async function handleDelete() {
    setIsDeleting(true);
    await leaveRoom(room.roomCode);
    router.refresh();
  }

  return (
    <div className="relative group">

      {/* ── 카드 본체 (Link) ── */}
      <Link href={`/room/${room.roomCode}`} className="block">
        <div
          className={[
            "rounded-2xl overflow-hidden border border-hairline",
            "shadow-sm hover:shadow-md",
            "transition-all duration-200 hover:-translate-y-0.5",
            isExpired ? "opacity-50 pointer-events-none" : "",
          ].join(" ")}
        >
          {/* 커버 (2:3 비율) */}
          <div
            className={`relative aspect-3/3 bg-linear-to-br ${cat.from} ${cat.to}
              flex flex-col items-center justify-center gap-2`}
          >
            <span className="text-[44px] drop-shadow-sm">{cat.emoji}</span>
            <span className="font-mono text-[11px] font-bold text-black/40 tracking-[3px] uppercase">
              {room.roomCode}
            </span>

            {/* 만료 오버레이 */}
            {isExpired && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-[12px] font-semibold tracking-wide">
                  만료된 모임
                </span>
              </div>
            )}

            {/* 호버 오버레이 */}
            {!isExpired && (
              <div className={[
                "absolute inset-0 flex items-end justify-center pb-4",
                "bg-black/0 group-hover:bg-black/15",
                "opacity-0 group-hover:opacity-100",
                "transition-all duration-200",
              ].join(" ")}>
                <span className="text-white text-[12px] font-semibold drop-shadow">
                  입장하기 →
                </span>
              </div>
            )}
          </div>

          {/* 정보 영역 */}
          <div className="bg-white px-3 pt-2.5 pb-3 flex flex-col gap-1.5">
            <p className="text-[13px] font-bold text-ink truncate">
              {room.name || `${cat.label} 모임`}
            </p>
            <Badge variant={status.variant} dot>
              {status.label}
            </Badge>
          </div>
        </div>
      </Link>

      {/* ── 호스트 뱃지 — Link 밖, 절대 위치 ── */}
      {isHost && (
        <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-bold bg-white/80 backdrop-blur-sm text-accent px-2 py-0.5 rounded-full shadow-sm pointer-events-none">
          👑 호스트
        </span>
      )}

      {/* ── 삭제 버튼 — Link 밖, 절대 위치 ── */}
      <button
        onClick={() => setConfirming(true)}
        className="absolute top-2.5 right-2.5 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors text-[12px]"
        aria-label="모임 삭제"
      >
        🗑️
      </button>

      {/* ── 삭제 확인 오버레이 — Link 밖, 절대 위치 ── */}
      {confirming && (
        <div className="absolute inset-0 z-20 rounded-2xl bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 px-4">
          <p className="text-white text-[13px] font-bold text-center leading-snug">
            {isHost ? "모임을 삭제할까요?" : "모임에서 나갈까요?"}
          </p>
          {isHost && (
            <p className="text-white/70 text-[11px] text-center leading-snug">
              참가자 전체가 퇴장됩니다
            </p>
          )}
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 h-8 rounded-lg bg-white/20 text-white text-[12px] font-semibold hover:bg-white/30 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 h-8 rounded-lg bg-[#DC2626] text-white text-[12px] font-semibold hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
            >
              {isDeleting ? "처리 중…" : "확인"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

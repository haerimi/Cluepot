"use client";

import { createClient } from "@/util/supabase/client";
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
    schedule: { id: string } | null;
  };
};

/* ── 카테고리별 설정 ─────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<
  string,
  { label: string; emoji: string; from: string; to: string }
> = {
  restaurant: {
    label: "맛집",
    emoji: "🍽",
    from: "from-[#FFE4D6]",
    to: "to-[#FFAB85]",
  },
  cafe: {
    label: "카페",
    emoji: "☕",
    from: "from-[#FFF3E0]",
    to: "to-[#FFCC80]",
  },
  bar: {
    label: "술자리",
    emoji: "🍻",
    from: "from-[#EDE7F6]",
    to: "to-[#B39DDB]",
  },
  brunch: {
    label: "브런치",
    emoji: "🥞",
    from: "from-[#E8F5E9]",
    to: "to-[#A5D6A7]",
  },
  dessert: {
    label: "디저트",
    emoji: "🍰",
    from: "from-[#FCE4EC]",
    to: "to-[#F48FB1]",
  },
};

const FALLBACK_CATEGORY = {
  label: "모임",
  emoji: "📍",
  from: "from-[#F0EDE7]",
  to: "to-[#D8D3CB]",
};

/* ── 상태별 설정 ─────────────────────────────────────────────────────── */

type StatusVariant = "warning" | "accent" | "success" | "muted";

const STATUS_CONFIG: Record<string, { label: string; variant: StatusVariant }> =
{
  waiting: { label: "대기 중", variant: "warning" },
  voting: { label: "추천 중", variant: "accent" },
  done: { label: "확정됨", variant: "success" },
  reselecting: { label: "장소 재선정 중", variant: "warning" },
};

const FALLBACK_STATUS = {
  label: "알 수 없음",
  variant: "muted" as StatusVariant,
};

/* ── 수정 확인 모달 ───────────────────────────────────────────────────── */
function confirmEditLabel(isEditing: boolean) {
  if (isEditing) return "처리 중…";
  return "수정";
}

function EditModal({
  isEditing,
  onCancel,
  onConfirm,
}: Readonly<{
  onCancel: () => void;
  onConfirm: () => void;
  isEditing: boolean;
}>) {

  return (
    /* fixed backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      {/* backdrop — click to cancel */}
      <button
        type="button"
        aria-label="취소"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] w-full h-full cursor-default"
        onClick={onCancel}
      />

      {/* sheet / dialog */}
      <div
        className="relative w-full max-w-90 bg-white rounded-t-[24px] sm:rounded-2xl shadow-xl px-6 pt-6 pb-8"
        style={{
          animation: "cinematic-up 0.3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-hairline rounded-full mx-auto mb-5" />

        {/* icon */}
        <div className="w-12 h-12 rounded-full bg-error-bg flex items-center justify-center mb-4 mx-auto">
          <span className="text-[22px] leading-none">✏️</span>
        </div>

        <h3 className="text-[18px] font-black text-ink text-center mb-2 tracking-tight">
          모임을 수정할까요?
        </h3>
        <p className="text-[13px] text-ink-subtle text-center leading-relaxed mb-7">
          모임을 수정하면 참가자 모두에게 변경 사항이 적용돼요.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isEditing}
            className="flex-1 h-11 rounded-xl border border-hairline text-[14px] font-semibold text-ink-muted hover:bg-surface-3 transition-colors disabled:opacity-60"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isEditing}
            className="flex-1 h-11 rounded-xl bg-accent-hover text-white text-[14px] font-semibold hover:bg-accent-active transition-colors disabled:opacity-60"
          >
            {confirmEditLabel(isEditing)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 삭제 확인 모달 ───────────────────────────────────────────────────── */

function confirmLabel(isDeleting: boolean, isHost: boolean): string {
  if (isDeleting) return "처리 중…";
  return isHost ? "삭제" : "나가기";
}

function DeleteModal({
  isHost,
  isDeleting,
  onCancel,
  onConfirm,
}: Readonly<{
  isHost: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>) {
  return (
    /* fixed backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      {/* backdrop — click to cancel */}
      <button
        type="button"
        aria-label="취소"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] w-full h-full cursor-default"
        onClick={onCancel}
      />

      {/* sheet / dialog */}
      <div
        className="relative w-full max-w-90 bg-white rounded-t-[24px] sm:rounded-2xl shadow-xl px-6 pt-6 pb-8"
        style={{
          animation: "cinematic-up 0.3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-hairline rounded-full mx-auto mb-5" />

        {/* icon */}
        <div className="w-12 h-12 rounded-full bg-error-bg flex items-center justify-center mb-4 mx-auto">
          <span className="text-[22px] leading-none">🗑️</span>
        </div>

        <h3 className="text-[18px] font-black text-ink text-center mb-2 tracking-tight">
          {isHost ? "모임을 삭제할까요?" : "모임에서 나갈까요?"}
        </h3>
        <p className="text-[13px] text-ink-subtle text-center leading-relaxed mb-7">
          {isHost
            ? "삭제하면 모든 참가자가 퇴장되고 복구할 수 없어요."
            : "모임에서 나가면 다시 코드를 입력해야 재참가할 수 있어요."}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 h-11 rounded-xl border border-hairline text-[14px] font-semibold text-ink-muted hover:bg-surface-3 transition-colors disabled:opacity-60"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-11 rounded-xl bg-error text-white text-[14px] font-semibold hover:bg-error-hover transition-colors disabled:opacity-60"
          >
            {confirmLabel(isDeleting, isHost)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 컴포넌트 ────────────────────────────────────────────────────────── */

export function RoomCard({ data }: Readonly<{ data: RoomCardData }>) {
  const { isHost, room } = data;
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingEdit, setConfirmingEdit] = useState(false);

  const cat = CATEGORY_CONFIG[room.category] ?? FALLBACK_CATEGORY;
  const status =
    STATUS_CONFIG[room.schedule ? "done" : room.status] ?? FALLBACK_STATUS;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(null);


  // 파일 선택 이벤트 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]; // 선택한 파일 객체
    if (!selectedFile) return;

    setFile(selectedFile);
  };

  // 파일 제출 처리
  const handleSubmit = async () => {
    if (!file) return;
    const safeFileName = file.name
      .replace(/\s/g, "_")// 공백 제거
      .replace(/[^\w.-]/g, "");// 특수문자/한글 제거

    const filePath = `room_image/${Date.now()}-${safeFileName}`;

    const supabase = createClient();
    await supabase.auth.getUser();
    const { data, error } = await supabase.storage
      .from("cluepot")
      .upload(filePath, file);
  };

  async function handleDelete() {
    setIsDeleting(true);
    await leaveRoom(room.roomCode);
    setConfirming(false);
    router.refresh();
  }

  async function handleEdit() {
    setIsEditing(true);
    setConfirmingEdit(false);
    router.refresh();
  }


  return (
    <>
      <div className="relative group">
        {/* ── 카드 본체 (Link) ── */}
        <Link href={`/rooms/${room.roomCode}`} className="block">
          <div
            className="rounded-2xl overflow-hidden border border-hairline shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
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

              {/* 호버 오버레이 */}
              <div
                className={[
                  "absolute inset-0 flex items-end justify-center pb-4",
                  "bg-black/0 group-hover:bg-black/15",
                  "opacity-0 group-hover:opacity-100",
                  "transition-all duration-200",
                ].join(" ")}
              >
                <span className="text-white text-[12px] font-semibold drop-shadow">
                  입장하기 →
                </span>
              </div>
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

        {/* ── 삭제 버튼 — 44px touch target ── */}
        <button
          onClick={() => setConfirming(true)}
          className="absolute top-1.5 right-1.5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors text-[16px] touch-manipulation"
          aria-label="모임 삭제"
        >
          🗑️
        </button>
        <button onClick={() => setConfirmingEdit(true)}
          className="absolute top-1.5 right-11 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors text-[16px] touch-manipulation"
          aria-label="모임 수정"
        >
          ✏️
        </button>
      </div>

      {/* ── 삭제 확인 모달 — fixed, 카드 밖에 렌더링 ── */}
      {confirming && (
        <DeleteModal
          isHost={isHost}
          isDeleting={isDeleting}
          onCancel={() => setConfirming(false)}
          onConfirm={handleDelete}
        />
      )}

      {/* ── 수정 모달  ── */}
      {confirmingEdit && (
        <EditModal
          isEditing={isEditing}
          onCancel={() => setConfirmingEdit(false)}
          onConfirm={handleEdit}
        />
      )}

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit}>업로드</button>
    </>
  );
}

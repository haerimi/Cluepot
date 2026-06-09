"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/app/components/ui/Badge";
import { leaveRoom, updateRoom } from "@/app/actions/rooms";
import { createClient } from "@/util/supabase/client";

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
    imageUrl: string | null;
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

/* ── 수정 모달 ────────────────────────────────────────────────────────── */

function EditRoomModal({
  currentName,
  catEmoji,
  catFrom,
  catTo,
  onCancel,
  onConfirm,
  imageUrl,
}: Readonly<{
  currentName: string;
  catEmoji: string;
  catFrom: string;
  catTo: string;
  onCancel: () => void;
  onConfirm: (name: string, file: File | null) => Promise<void>;
  imageUrl: string | null;
}>) {
  const [name, setName] = useState(currentName);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // previewUrl이 교체되거나 모달이 닫힐 때 Object URL을 해제해 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Esc 키로 모달 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSaving) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onCancel]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSave() {
    setSaveError(null);
    setIsSaving(true);
    try {
      await onConfirm(name, file);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="취소"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] w-full h-full cursor-default"
        onClick={isSaving ? undefined : onCancel}
      />

      {/* sheet */}
      <dialog
        open
        aria-labelledby="edit-room-modal-title"
        className="relative w-full max-w-90 bg-white rounded-t-[24px] sm:rounded-2xl shadow-xl px-6 pt-6 pb-8 flex flex-col gap-5 m-0 p-0"
        style={{ animation: "cinematic-up 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* drag handle */}
        <div className="sm:hidden w-10 h-1 bg-hairline rounded-full mx-auto -mb-1" />

        {/* 헤더 */}
        <h3 id="edit-room-modal-title" className="text-[18px] font-black text-ink text-center tracking-tight">
          모임 수정
        </h3>

        {/* 커버 사진 업로드 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="edit-room-cover" className="text-[13px] font-semibold text-ink-subtle">
            커버 사진
          </label>
          <label htmlFor="edit-room-cover" className="cursor-pointer group">
            <input
              id="edit-room-cover"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
            {/* 미리보기 / 플레이스홀더 — 중첩 삼항 대신 displayUrl로 분리 */}
            {(() => {
              const displayUrl = previewUrl ?? imageUrl;
              if (displayUrl) {
                return (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-hairline">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayUrl}
                      alt="커버 미리보기"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-[12px] font-semibold transition-opacity">
                        사진 변경
                      </span>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  className={`w-full aspect-video rounded-xl bg-linear-to-br ${catFrom} ${catTo}
                    flex flex-col items-center justify-center gap-2 border border-hairline
                    group-hover:brightness-95 transition-all`}
                >
                  <span className="text-[32px]">{catEmoji}</span>
                  <span className="text-[12px] font-semibold text-black/40 bg-white/60 rounded-full px-3 py-0.5">
                    사진 선택
                  </span>
                </div>
              );
            })()}
          </label>
        </div>

        {/* 모임 이름 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="edit-room-name"
            className="text-[13px] font-semibold text-ink-subtle"
          >
            모임 이름
          </label>
          <input
            id="edit-room-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="모임 이름을 입력하세요"
            className="h-11 rounded-xl border border-hairline px-3.5 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
          />
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 pt-1">
            <button
              onClick={isSaving ? undefined : onCancel}
              disabled={isSaving}
              className="flex-1 h-11 rounded-xl border border-hairline text-[14px] font-semibold text-ink-muted hover:bg-surface-3 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-11 rounded-xl bg-accent-active text-white text-[14px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  저장 중...
                </>
              ) : "저장"}
            </button>
          </div>
          {saveError && (
            <p className="text-red-400 text-xs mt-1 text-center">{saveError}</p>
          )}
        </div>
      </dialog>
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
  // Esc 키로 모달 닫기 (삭제 중에는 닫기 방지)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onCancel]);

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
        onClick={isDeleting ? undefined : onCancel}
      />

      {/* sheet / dialog */}
      <dialog
        open
        aria-labelledby="delete-modal-title"
        className="relative w-full max-w-90 bg-white rounded-t-[24px] sm:rounded-2xl shadow-xl px-6 pt-6 pb-8 m-0 p-0"
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

        <h3 id="delete-modal-title" className="text-[18px] font-black text-ink text-center mb-2 tracking-tight">
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
      </dialog>
    </div>
  );
}

/* ── 컴포넌트 ────────────────────────────────────────────────────────── */

export function RoomCard({ data }: Readonly<{ data: RoomCardData }>) {
  const { isHost, room } = data;
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const cat = CATEGORY_CONFIG[room.category] ?? FALLBACK_CATEGORY;
  const status =
    STATUS_CONFIG[room.schedule ? "done" : room.status] ?? FALLBACK_STATUS;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await leaveRoom(room.roomCode);
      setConfirming(false);
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  }

  async function handleEditConfirm(title: string, file: File | null): Promise<void> {
    let imageUrl: string | undefined;

    if (file) {
      const supabase = createClient();
      const safeName = file.name.replace(/\s/g, "_").replace(/[^\w.-]/g, "");
      const path = `room_image/${Date.now()}_${safeName}`;
      const { error } = await supabase.storage.from("cluepot").upload(path, file);
      if (error) {
        console.error("이미지 업로드 실패:", error);
        throw new Error("이미지 업로드에 실패했어요. 다시 시도해주세요.");
      }
      const { data } = supabase.storage.from("cluepot").getPublicUrl(path);
      imageUrl = data.publicUrl;
    }
    await updateRoom(room.roomCode, title, imageUrl ?? null);
    setEditModalOpen(false);
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
              {!room.imageUrl ? (
                <>
                  <span className="text-[44px] drop-shadow-sm">{cat.emoji}</span>
                  <span className="font-mono text-[11px] font-bold text-black/40 tracking-[3px] uppercase">
                    {room.roomCode}
                  </span>
                </>
              ) : (
                <img src={room.imageUrl} alt={`${room.name} 커버`} className="w-full h-full object-cover" />
              )}

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
          className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors text-[10px] touch-manipulation"
          aria-label="모임 삭제"
        >
          🗑️
        </button>
        <button
          onClick={() => setEditModalOpen(true)}
          className="absolute top-2.5 right-12 z-10 px-2 py-0.5 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors text-[10px] touch-manipulation"
          aria-label="모임 수정"
        >
          ✏️
        </button>
      </div>

      {/* ── 삭제 확인 모달 ── */}
      {confirming && (
        <DeleteModal
          isHost={isHost}
          isDeleting={isDeleting}
          onCancel={() => setConfirming(false)}
          onConfirm={handleDelete}
        />
      )}

      {/* ── 수정 모달 ── */}
      {editModalOpen && (
        <EditRoomModal
          currentName={room.name}
          catEmoji={cat.emoji}
          catFrom={cat.from}
          catTo={cat.to}
          onCancel={() => setEditModalOpen(false)}
          onConfirm={handleEditConfirm}
          imageUrl={room.imageUrl}
        />
      )}
    </>
  );
}

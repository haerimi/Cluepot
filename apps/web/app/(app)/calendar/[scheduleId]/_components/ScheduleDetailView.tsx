"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import Link from "next/link";
import { KakaoMap } from "@/app/components/KakaoMap";
import { Button } from "@/app/components/ui/Button";
import {
  updateSchedule,
  updateMemberStatus,
  getScheduleById,
  type ScheduleDetail,
  cancelSchedule,
} from "@/app/actions/schedule";
import { leaveRoom } from "@/app/actions/rooms";
import { useRouter } from "next/navigation";

/* ── Date/time formatting ────────────────────────────────────────────────── */

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? "오전" : "오후";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const min = String(m).padStart(2, "0");
  return { date: datePart, time: `${period} ${hour}:${min}` };
}

function toInputDatetime(iso: string) {
  const d = new Date(iso);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 16);
}

/* ── Participant chip (panel 전용) ───────────────────────────────────────── */

function ParticipantChip({
  nickname,
  status,
  isMe,
  profileImage,
}: {
  nickname: string;
  status: string;
  isMe: boolean;
  profileImage: string | null;
}) {
  const statusConfig = {
    accepted: { label: "수락", bg: "bg-success-bg", text: "text-success-text" },
    declined: { label: "거절", bg: "bg-error-bg", text: "text-error" },
    pending: { label: "보류", bg: "bg-surface-3", text: "text-ink-subtle" },
  } as const;
  const cfg =
    statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;

  return (
    <div className="flex items-center gap-2.5 py-3 px-4 bg-surface rounded-xl border border-hairline">
      <div
        className={[
          "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 overflow-hidden",
          isMe ? "bg-accent text-white" : "bg-surface-3 text-ink-muted",
        ].join(" ")}
      >
        {profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profileImage} alt={nickname} className="w-full h-full object-cover" />
        ) : (
          nickname.charAt(0)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink truncate">
          {nickname}
        </p>
        {isMe && <p className="text-[10px] text-ink-tertiary">나</p>}
      </div>
      <span
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
      >
        {cfg.label}
      </span>
    </div>
  );
}

/* ── Edit modal ──────────────────────────────────────────────────────────── */

function EditModal({
  schedule,
  onClose,
  onSaved,
}: {
  schedule: ScheduleDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(schedule.title);
  const [dt, setDt] = useState(toInputDatetime(schedule.scheduledAt));
  const [memo, setMemo] = useState(schedule.memo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  function handleSave() {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!dt) {
      setError("날짜와 시간을 선택해주세요");
      return;
    }
    setError(null);
    start(async () => {
      await updateSchedule(
        schedule.id,
        {
          title: title.trim(),
          scheduledAt: `${dt}:00+09:00`,
          memo: memo || null
        },
        schedule.roomCode);
      await updateSchedule(
        schedule.id,
        {
          title: title.trim(),
          scheduledAt: `${dt}:00+09:00`,
          memo: memo || null
        },
        schedule.roomCode);
      onSaved();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-[440px] bg-surface border border-hairline rounded-t-[24px] sm:rounded-2xl
                      px-6 pt-6 pb-8"
        style={{
          animation: "cinematic-up 0.3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div className="sm:hidden w-10 h-1 bg-hairline rounded-full mx-auto mb-5" />

        <h2 className="text-[20px] font-black text-ink tracking-tight mb-6">
          날짜·시간 수정
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              className="w-full h-11 px-4 rounded-xl border border-hairline bg-canvas text-[16px] text-ink
                         outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-surface-2"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
              날짜 및 시간
            </label>
            <input
              type="datetime-local"
              value={dt}
              onChange={(e) => {
                setDt(e.target.value);
                setError(null);
              }}
              className="w-full h-11 px-4 rounded-xl border border-hairline bg-canvas text-[16px] text-ink
                         outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-surface-2"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
              메모{" "}
              <span className="text-ink-tertiary font-normal normal-case tracking-normal">
                (선택)
              </span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-hairline bg-canvas text-[16px] text-ink
                         resize-none outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-surface-2"
            />
          </div>
          {error && (
            <p className="text-[12px] text-error flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1L15 14H1L8 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.8" fill="currentColor"/></svg>
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onClick={handleSave}
          >
            {isPending ? "저장하는 중…" : "저장하기"}
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Leave confirmation ─────────────────────────────────────────────────── */

function LeaveConfirm({
  roomCode,
  onClose,
}: {
  roomCode: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  function handleLeave() {
    start(async () => {
      await leaveRoom(roomCode);
      router.push("/calendar");
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[360px] bg-surface border border-hairline rounded-2xl p-7"
        style={{ animation: "fade-up 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <h3 className="text-[18px] font-black text-ink mb-2">
          해당 일정에서 나가실건가요?
        </h3>
        <p className="text-[13px] text-ink-subtle leading-relaxed mb-7">
          나가게 된 일정은 복구할 수 없어요. 다른 참가자의 일정에는 영향을 주지
          않아요.
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="danger"
            size="md"
            fullWidth
            loading={isPending}
            onClick={handleLeave}
          >
            {isPending ? "나가는 중…" : "나가기"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete confirmation ─────────────────────────────────────────────────── */

function DeleteConfirm({
  scheduleId,
  onClose,
}: {
  scheduleId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  function handleDelete() {
    start(async () => {
      await cancelSchedule(scheduleId);
      router.push("/calendar");
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[360px] bg-surface border border-hairline rounded-2xl p-7"
        style={{ animation: "fade-up 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <h3 className="text-[18px] font-black text-ink mb-2">
          일정을 삭제할까요?
        </h3>
        <p className="text-[13px] text-ink-subtle leading-relaxed mb-7">
          삭제된 일정은 복구할 수 없어요. 모든 참가자의 일정에서도 제거돼요.
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="danger"
            size="md"
            fullWidth
            loading={isPending}
            onClick={handleDelete}
          >
            {isPending ? "삭제 중…" : "삭제하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReplacePlaceConfirm({
  scheduleId,
  roomCode,
  onClose
}: {
  scheduleId: string;
  roomCode: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  function handleConfirm() {
    start(async () => {
      await cancelSchedule(scheduleId);
      router.push(`/rooms/${roomCode}`);
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[360px] bg-surface border border-hairline rounded-2xl p-7"
        style={{ animation: "fade-up 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <h3 className="text-[18px] font-black text-ink mb-2">
          일정을 수정할까요?
        </h3>
        <p className="text-[13px] text-ink-subtle leading-relaxed mb-7">
          장소를 다시 찾으시겠어요? 참가자들은 유지돼요.
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="danger"
            size="md"
            fullWidth
            loading={isPending}
            onClick={handleConfirm}
          >
            {isPending ? "수정 중…" : "수정하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */

interface ScheduleDetailViewProps {
  schedule: ScheduleDetail;
  /** "page": 독립 페이지 (기본값), "panel": 캘린더 우패널 인라인 */
  variant?: "page" | "panel";
}

export function ScheduleDetailView({ schedule, variant = "page" }: ScheduleDetailViewProps) {
  const isPanel = variant === "panel";
  const [data, setData] = useState(schedule);

  const { date, time } = formatDateTime(data.scheduledAt);
  const isCreator = data.createdBy === data.currentUserId;
  const myMember = data.members.find(
    (m) => m.userId === data.currentUserId,
  );

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [isPending, start] = useTransition();
  const [showReplace, setShowReplace] = useState(false);

  /* 마우스 시차 효과 (page 모드 전용) */
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (e.clientX - centerX) / 55;
    const moveY = (e.clientY - centerY) / 55;
    cardRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  }, []);

  useEffect(() => {
    if (isPanel) return;
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isPanel, handleMouseMove]);

  useEffect(() => {
    const scheduleId = schedule.id;

    async function fetchLatest() {
      const updated = await getScheduleById(scheduleId);
      if (updated) setData(updated);
    }

    let interval = setInterval(fetchLatest, 5000);

    function handleVisibility() {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchLatest();
        interval = setInterval(fetchLatest, 5000);
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [schedule.id]);

  useEffect(() => {
    const scheduleId = schedule.id;

    async function fetchLatest() {
      const updated = await getScheduleById(scheduleId);
      if (updated) setData(updated);
    }

    let interval = setInterval(fetchLatest, 5000);

    function handleVisibility() {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchLatest();
        interval = setInterval(fetchLatest, 5000);
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [schedule.id]);

  function handleAttendance(status: "accepted" | "declined") {
    if (myMember?.status === status) return;
    start(async () => {
      try {
        await updateMemberStatus(data.id, status);
        const updated = await getScheduleById(data.id);
        if (updated) setData(updated);
      } catch {
        // 실패해도 UI가 깨지지 않도록 — 필요 시 toast 추가
      }
    });
  }

  /* ── panel 모드: 기존 UI 유지 ────────────────────────────────────────── */
  if (isPanel) {
    return (
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ animation: "section-fade 0.4s ease-out both" }}
      >
        {/* ── 헤더 ── */}
        <div className="px-5 pt-5 pb-5 border-b border-hairline">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-px bg-hairline-strong" />
              <span className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase">
                확정된 모임
              </span>
            </div>
            <h1 className="text-[20px] font-black text-ink tracking-tight leading-tight mb-1.5">
              {data.title}
            </h1>
            <p className="text-[13px] text-ink-subtle">{date}</p>
            <p className="text-[18px] font-black text-accent tracking-tight mt-0.5">
              {time}
            </p>

            {isCreator ? (
              <div className="flex items-center gap-2 flex-wrap mt-4">
                <button
                  onClick={() => setShowEdit(true)}
                  className="h-9 px-3 rounded-lg border border-hairline text-[12px] font-medium text-ink-muted
                             hover:border-hairline-strong hover:text-ink transition-colors"
                >
                  날짜·시간
                </button>
                <button
                  onClick={() => setShowReplace(true)}
                  className="h-9 px-3 rounded-lg border border-hairline text-[12px] font-medium text-ink-muted
                             hover:border-hairline-strong hover:text-ink transition-colors"
                >
                  장소 변경
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="h-9 px-3 rounded-lg border border-error-border text-[12px] font-medium text-error
                             hover:bg-error-bg transition-colors"
                >
                  삭제
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setShowLeave(true)}
                  className="h-9 px-3 rounded-lg border border-hairline text-[12px] font-medium text-ink-muted
                             hover:border-hairline-strong hover:text-ink transition-colors"
                >
                  나가기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 바디 ── */}
        <div className="px-5 py-6 space-y-7">
          <section>
            <p className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase mb-4">
              장소
            </p>
<<<<<<< HEAD
            <div className="bg-surface rounded-2xl border border-hairline overflow-hidden">
=======
            <div className="bg-white rounded-2xl border border-hairline overflow-hidden shadow-sm">
>>>>>>> main
              <KakaoMap
                lat={data.lat}
                lng={data.lng}
                placeName={data.placeName}
                className="w-full h-[160px]"
              />
              <div className="px-5 py-4">
                <p className="text-[16px] font-bold text-ink mb-0.5">
                  {data.placeName}
                </p>
                <p className="text-[13px] text-ink-subtle">
                  {data.placeAddress}
                </p>
                {data.memo && (
                  <>
                    <div className="h-px bg-hairline my-3" />
                    <p className="text-[13px] text-ink-muted leading-relaxed">
                      {data.memo}
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase">
                참가자 · {data.members.length}명
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
                {data.members.filter((m) => m.status === "accepted").length}명
                수락
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.members.map((m) => (
                <ParticipantChip
                  key={m.id}
                  nickname={m.nickname}
                  status={m.status}
                  isMe={m.userId === data.currentUserId}
                  profileImage={m.profileImage}
                />
              ))}
            </div>
          </section>

          {myMember && (
            <section>
              <p className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase mb-4">
                내 참석 여부
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAttendance("accepted")}
                  disabled={isPending}
                  aria-pressed={myMember.status === "accepted"}
                  className={[
                    "flex-1 h-11 rounded-xl text-[14px] font-semibold border transition-all",
                    myMember.status === "accepted"
                      ? "bg-success-bg border-success/30 text-success-text"
<<<<<<< HEAD
                      : "bg-surface border-hairline text-ink-muted hover:border-success/30 hover:bg-success-bg-alt",
=======
                      : "bg-white border-hairline text-ink-muted hover:border-success/30 hover:bg-success-bg-alt",
>>>>>>> main
                  ].join(" ")}
                >
                  {isPending ? "…" : "✓ 참석할게요"}
                </button>
                <button
                  onClick={() => handleAttendance("declined")}
                  disabled={isPending}
                  aria-pressed={myMember.status === "declined"}
                  className={[
                    "flex-1 h-11 rounded-xl text-[14px] font-semibold border transition-all",
                    myMember.status === "declined"
                      ? "bg-error-bg border-error/30 text-error"
<<<<<<< HEAD
                      : "bg-surface border-hairline text-ink-muted hover:border-error/30 hover:bg-error-bg-alt",
=======
                      : "bg-white border-hairline text-ink-muted hover:border-error/30 hover:bg-error-bg-alt",
>>>>>>> main
                  ].join(" ")}
                >
                  {isPending ? "…" : "✕ 참석 못해요"}
                </button>
              </div>
            </section>
          )}
        </div>

        {showEdit && (
          <EditModal
            schedule={data}
            onClose={() => setShowEdit(false)}
            onSaved={async () => {
              const updated = await getScheduleById(data.id);
              if (updated) setData(updated);
              setShowEdit(false);
            }}
          />
        )}
        {showDelete && (
          <DeleteConfirm scheduleId={data.id} onClose={() => setShowDelete(false)} />
        )}
        {showReplace && (
          <ReplacePlaceConfirm
            scheduleId={schedule.id}
            roomCode={data.roomCode}
            onClose={() => setShowReplace(false)}
          />
        )}
        {showLeave && (
          <LeaveConfirm roomCode={data.roomCode} onClose={() => setShowLeave(false)} />
        )}
      </div>
    );
  }

  /* ── page 모드: Stitch 디자인 기반 다크 확정 페이지 ─────────────────── */

  const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(data.placeName)},${data.lat},${data.lng}`;

  /* 참석 수락 인원 수 */
  const acceptedCount = data.members.filter((m) => m.status === "accepted").length;

  /* 아바타 스택에 표시할 최대 인원 */
  const AVATAR_LIMIT = 4;
  const visibleMembers = data.members.slice(0, AVATAR_LIMIT);
  const overflowCount = data.members.length - AVATAR_LIMIT;

  /* 참가자 이름 요약 텍스트 */
  const nameList = data.members.slice(0, 2).map((m) => m.nickname);
  const nameSummary =
    data.members.length > 2
      ? `${nameList.join(", ")} 외 ${data.members.length - 2}명`
      : nameList.join(", ");

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto relative"
      style={{ background: "var(--color-canvas)" }}
    >
      {/* ── 도트 그리드 배경 ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
<<<<<<< HEAD
            "radial-gradient(circle at 1.5px 1.5px, rgba(94,106,210,0.15) 1.5px, transparent 0)",
=======
            "radial-gradient(circle at 1.5px 1.5px, rgba(114,152,199,0.15) 1.5px, transparent 0)",
>>>>>>> main
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── 방사형 그라디언트 오버레이 — 도트 중심부 희석 ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, var(--color-canvas) 80%)",
        }}
      />

      {/* ── 앰비언트 글로우 ── */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
<<<<<<< HEAD
            "radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 65%)",
=======
            "radial-gradient(circle, rgba(114,152,199,0.08) 0%, transparent 65%)",
>>>>>>> main
        }}
      />

      {/* ── 위치 핀 (장식용 pulse) ── */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none pin-animation"
      >
        <div className="relative flex items-center justify-center">
          {/* 퍼지는 링 */}
          <div
            className="absolute w-16 h-16 rounded-full"
            style={{
<<<<<<< HEAD
              background: "rgba(94,106,210,0.12)",
=======
              background: "rgba(114,152,199,0.12)",
>>>>>>> main
              animation: "pin-ring 2s ease-out infinite",
            }}
          />
          <div
            className="absolute w-10 h-10 rounded-full"
            style={{
<<<<<<< HEAD
              background: "rgba(94,106,210,0.08)",
=======
              background: "rgba(114,152,199,0.08)",
>>>>>>> main
              animation: "pin-ring 2s ease-out 0.5s infinite",
            }}
          />
          {/* 핀 본체 */}
          <div
            className="w-5 h-5 rounded-full border-4 relative z-10"
            style={{
<<<<<<< HEAD
              background: "#5e6ad2",
              borderColor: "var(--color-canvas)",
              boxShadow: "0 0 20px rgba(94,106,210,0.5)",
=======
              background: "#7298C7",
              borderColor: "var(--color-canvas)",
              boxShadow: "0 0 20px rgba(114,152,199,0.5)",
>>>>>>> main
            }}
          />
        </div>
      </div>

      {/* ── 상단 뒤로가기 ── */}
      <div className="relative z-10 pt-7 px-5 sm:px-8">
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded text-ink-subtle hover:text-ink"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="group-hover:-translate-x-0.5 transition-transform"
          >
            <path
              d="M9 2.5L4.5 7L9 11.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          모임 일정
        </Link>
      </div>

      {/* ── 콘텐츠 중앙 정렬 ── */}
      <div
        className="relative z-10 flex flex-col items-center px-4 pb-16 pt-10 sm:pt-12"
        style={{ animation: "section-fade 0.4s ease-out both" }}
      >

        {/* 성공 아이콘 + 헤드라인 */}
        <div
          className="text-center mb-8 sm:mb-10"
          style={{ animation: "cinematic-up 0.65s ease-out both" }}
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5 border"
            style={{
              background: "rgba(39,166,68,0.15)",
              borderColor: "rgba(39,166,68,0.28)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="rgba(39,166,68,0.18)"
                stroke="#27a644"
                strokeWidth="1.5"
              />
              <path
                d="M7.5 12l3 3 6-6"
                stroke="#27a644"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1
            className="font-black mb-2 leading-tight text-ink"
            style={{
              fontSize: "clamp(26px, 5vw, 34px)",
              letterSpacing: "-0.8px",
            }}
          >
            모임이 확정됐어요!
          </h1>
          <p className="text-ink-subtle" style={{ fontSize: "15px" }}>
            모든 참가자에게 장소가 공유됐어요
          </p>
        </div>

        {/* ── 카드 ── */}
        <div
          ref={cardRef}
<<<<<<< HEAD
          className="w-full max-w-[520px] bg-surface border border-hairline"
=======
          className="w-full max-w-[520px] bg-white border border-hairline"
>>>>>>> main
          style={{
            borderRadius: "16px",
            padding: "clamp(24px, 5vw, 32px)",
            boxShadow:
<<<<<<< HEAD
              "0 10px 32px -4px rgba(0,0,0,0.55), 0 4px 8px -4px rgba(0,0,0,0.35)",
=======
              "0 10px 32px -4px rgba(26,32,51,0.12), 0 4px 8px -4px rgba(26,32,51,0.08)",
>>>>>>> main
            animation: "cinematic-up 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both",
            transition: "transform 0.12s ease-out",
          }}
        >
          {/* 모임 이름 */}
          <div className="mb-6">
            <label className="block font-bold uppercase mb-2 text-ink-tertiary" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
              모임 이름
            </label>
            <h2 className="font-bold leading-tight text-ink" style={{ fontSize: "22px", letterSpacing: "-0.4px" }}>
              {data.title}
            </h2>
          </div>

          {/* 날짜 + 장소 그리드 */}
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block font-bold uppercase mb-2 text-ink-tertiary" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                날짜 및 시간
              </label>
              <div className="flex items-center gap-1.5 mb-1 text-accent">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
                  <rect x="1" y="2" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1 5h12" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span className="text-ink font-medium" style={{ fontSize: "13px" }}>
                  {date.split(" ").slice(0, 3).join(" ")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-ink-muted">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M7 4.5v2.75l1.75 1.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "13px" }}>{time}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase mb-2 text-ink-tertiary" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                장소
              </label>
              <div className="flex items-start gap-1.5 text-ink-muted">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
                  <path d="M7 1.5C4.52 1.5 2.5 3.52 2.5 6c0 3.75 4.5 7.5 4.5 7.5S11.5 9.75 11.5 6c0-2.48-2.02-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                <div className="min-w-0">
                  <p className="font-semibold leading-snug truncate text-ink" style={{ fontSize: "13px" }}>
                    {data.placeName}
                  </p>
                  <p className="mt-0.5 leading-snug line-clamp-2 text-ink-subtle" style={{ fontSize: "11px" }}>
                    {data.placeAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="mb-6 h-px bg-hairline" />

          {/* 참가자 섹션 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold uppercase text-ink-tertiary" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                참가자 · {data.members.length}명
              </label>
              {acceptedCount > 0 && (
                <span className="flex items-center gap-1 font-semibold text-success-text" style={{ fontSize: "11px" }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
                  {acceptedCount}명 수락
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* 아바타 스택 */}
              <div className="flex -space-x-3" role="list" aria-label="참가자 목록">
                {visibleMembers.map((m) => (
                  <div
                    key={m.id}
                    role="listitem"
                    title={m.nickname}
<<<<<<< HEAD
                    className="w-10 h-10 rounded-full border-2 border-canvas overflow-hidden flex items-center justify-center text-[13px] font-bold shrink-0 bg-surface-3 text-ink-muted"
=======
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-[13px] font-bold shrink-0 bg-surface-3 text-ink-muted"
>>>>>>> main
                  >
                    {m.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.profileImage} alt={m.nickname} className="w-full h-full object-cover" />
                    ) : (
                      m.nickname.charAt(0)
                    )}
                  </div>
                ))}
                {overflowCount > 0 && (
                  <div
<<<<<<< HEAD
                    className="w-10 h-10 rounded-full border-2 border-canvas flex items-center justify-center font-bold shrink-0 bg-surface-2 text-ink-subtle"
=======
                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-bold shrink-0 bg-surface-warm text-ink-subtle"
>>>>>>> main
                    style={{ fontSize: "11px" }}
                    aria-label={`외 ${overflowCount}명`}
                  >
                    +{overflowCount}
                  </div>
                )}
              </div>

              <p className="text-ink-subtle" style={{ fontSize: "13px" }}>
                {nameSummary}
              </p>
            </div>
          </div>

          {/* 내 참석 여부 */}
          {myMember && (
            <>
              <div className="mb-5 h-px bg-hairline" />
              <div className="mb-6">
                <label className="block font-bold uppercase mb-3 text-ink-tertiary" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                  내 참석 여부
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAttendance("accepted")}
                    disabled={isPending}
                    aria-pressed={myMember.status === "accepted"}
                    className={[
                      "flex-1 h-11 rounded-xl text-[14px] font-semibold border transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success",
                      myMember.status === "accepted"
                        ? "bg-success-bg border-success/30 text-success-text"
<<<<<<< HEAD
                        : "bg-surface border-hairline text-ink-muted hover:border-success/30 hover:bg-success-bg-alt",
=======
                        : "bg-white border-hairline text-ink-muted hover:border-success/30 hover:bg-success-bg-alt",
>>>>>>> main
                    ].join(" ")}
                  >
                    {isPending ? "…" : "✓ 참석할게요"}
                  </button>
                  <button
                    onClick={() => handleAttendance("declined")}
                    disabled={isPending}
                    aria-pressed={myMember.status === "declined"}
                    className={[
                      "flex-1 h-11 rounded-xl text-[14px] font-semibold border transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error",
                      myMember.status === "declined"
                        ? "bg-error-bg border-error/30 text-error"
<<<<<<< HEAD
                        : "bg-surface border-hairline text-ink-muted hover:border-error/30 hover:bg-error-bg-alt",
=======
                        : "bg-white border-hairline text-ink-muted hover:border-error/30 hover:bg-error-bg-alt",
>>>>>>> main
                    ].join(" ")}
                  >
                    {isPending ? "…" : "✕ 참석 못해요"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── 액션 버튼 ── */}
          <div className="space-y-3">
            {/* Primary CTA — 카카오맵으로 보기 */}
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
<<<<<<< HEAD
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-[14px] text-white transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 bg-accent hover:bg-accent-hover shadow-[0_2px_8px_rgba(94,106,210,0.3)] hover:shadow-[0_4px_14px_rgba(94,106,210,0.4)] hover:-translate-y-0.5"
=======
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-[14px] text-white transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 bg-accent hover:bg-accent-hover shadow-[0_2px_8px_rgba(114,152,199,0.3)] hover:shadow-[0_4px_14px_rgba(114,152,199,0.4)] hover:-translate-y-0.5"
>>>>>>> main
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 4.16 5 8.5 5 8.5S13.5 10.16 13.5 6c0-2.48-2.02-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="6" r="1.75" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              지도로 보기
            </a>

            {/* 2순위 버튼 행 */}
            {isCreator ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEdit(true)}
<<<<<<< HEAD
                  className="flex-1 h-12 rounded-xl font-semibold text-[14px] border border-hairline bg-surface text-ink hover:bg-surface-2 hover:border-hairline-strong transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
=======
                  className="flex-1 h-12 rounded-xl font-semibold text-[14px] border border-hairline bg-white text-ink hover:bg-surface-warm hover:border-hairline-strong transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
>>>>>>> main
                >
                  날짜·시간
                </button>
                <button
                  onClick={() => setShowReplace(true)}
<<<<<<< HEAD
                  className="flex-1 h-12 rounded-xl font-semibold text-[14px] border border-hairline bg-surface text-ink hover:bg-surface-2 hover:border-hairline-strong transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
=======
                  className="flex-1 h-12 rounded-xl font-semibold text-[14px] border border-hairline bg-white text-ink hover:bg-surface-warm hover:border-hairline-strong transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
>>>>>>> main
                >
                  장소 변경
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLeave(true)}
<<<<<<< HEAD
                className="w-full h-12 rounded-xl font-semibold text-[14px] border border-hairline bg-surface text-ink hover:bg-surface-2 hover:border-hairline-strong transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
=======
                className="w-full h-12 rounded-xl font-semibold text-[14px] border border-hairline bg-white text-ink hover:bg-surface-warm hover:border-hairline-strong transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
>>>>>>> main
              >
                나가기
              </button>
            )}

            {/* 삭제 — 호스트 전용, 최하단 */}
            {isCreator && (
              <button
                onClick={() => setShowDelete(true)}
                className="w-full h-10 rounded-xl text-[13px] font-medium border border-error-border text-error hover:bg-error-bg transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
              >
                일정 삭제
              </button>
            )}
          </div>
        </div>

        {/* 하단 안내 문구 */}
        <p className="mt-8 text-center text-ink-tertiary" style={{ fontSize: "13px" }}>
          장소 정보가 모든 참가자에게 공유됐어요
        </p>
      </div>

      {/* ── 모달 ── */}
      {showEdit && (
        <EditModal
          schedule={data}
          onClose={() => setShowEdit(false)}
          onSaved={async () => {
            const updated = await getScheduleById(data.id);
            if (updated) setData(updated);
            setShowEdit(false);
          }}
        />
      )}
      {showDelete && (
        <DeleteConfirm scheduleId={data.id} onClose={() => setShowDelete(false)} />
      )}
      {showReplace && (
        <ReplacePlaceConfirm
          scheduleId={schedule.id}
          roomCode={data.roomCode}
          onClose={() => setShowReplace(false)}
        />
      )}
      {showLeave && (
        <LeaveConfirm roomCode={data.roomCode} onClose={() => setShowLeave(false)} />
      )}
    </div>
  );
}

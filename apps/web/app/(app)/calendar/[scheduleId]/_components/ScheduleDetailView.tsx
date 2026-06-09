"use client";

import { useState, useEffect, useTransition } from "react";
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

/* ── Participant chip ────────────────────────────────────────────────────── */

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
    <div className="flex items-center gap-2.5 py-3 px-4 bg-white rounded-xl border border-hairline">
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
      await updateSchedule(schedule.id, {
        title: title.trim(),
        scheduledAt: `${dt}:00+09:00`,
        memo: memo || null,
      });
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
        className="relative w-full sm:max-w-[440px] bg-white rounded-t-[24px] sm:rounded-2xl
                      shadow-xl px-6 pt-6 pb-8"
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
                         outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
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
                         outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
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
                         resize-none outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
            />
          </div>
          {error && <p className="text-[12px] text-error">⚠️ {error}</p>}
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
        className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-xl p-7"
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
        className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-xl p-7"
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
        className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-xl p-7"
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
}

export function ScheduleDetailView({ schedule }: ScheduleDetailViewProps) {
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
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [router]);

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

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto"
      style={{ animation: "section-fade 0.4s ease-out both" }}
    >
      {/* ── Cinematic header ── */}
      <div className="px-6 lg:px-10 pt-8 pb-7 border-b border-hairline">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/calendar"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-subtle hover:text-ink transition-colors mb-6 group"
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

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-px bg-hairline-strong" />
                <span className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase">
                  확정된 모임
                </span>
              </div>
              <h1 className="text-[28px] lg:text-[36px] font-black text-ink tracking-tight leading-tight mb-2">
                {data.title}
              </h1>
              <p className="text-[16px] text-ink-subtle">{date}</p>
              <p className="text-[22px] lg:text-[28px] font-black text-accent tracking-tight mt-1">
                {time}
              </p>
            </div>

            {/* Creator actions */}
            {isCreator ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEdit(true)}
                  className="h-11 px-3 rounded-lg border border-hairline text-[13px] font-medium text-ink-muted
                             hover:border-hairline-strong hover:text-ink transition-colors"
                >
                  날짜·시간
                </button>
                <button
                  onClick={() => setShowReplace(true)}
                  className="h-11 px-3 rounded-lg border border-hairline text-[13px] font-medium text-ink-muted
                             hover:border-hairline-strong hover:text-ink transition-colors"
                >
                  장소 변경
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="h-11 px-3 rounded-lg border border-error-border text-[13px] font-medium text-error
                             hover:bg-error-bg transition-colors"
                >
                  삭제
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLeave(true)}
                  className="h-11 px-3 rounded-lg border border-hairline text-[13px] font-medium text-ink-muted
                             hover:border-hairline-strong hover:text-ink transition-colors"
                >
                  나가기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 space-y-10">
        {/* Place section */}
        <section>
          <p className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase mb-4">
            장소
          </p>
          <div className="bg-white rounded-2xl border border-hairline overflow-hidden shadow-sm">
            {/* Map */}
            <KakaoMap
              lat={data.lat}
              lng={data.lng}
              placeName={data.placeName}
              className="w-full h-[220px] lg:h-[280px]"
            />
            {/* Place info */}
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

        {/* Participants section */}
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

        {/* My attendance */}
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
                    : "bg-white border-hairline text-ink-muted hover:border-success/30 hover:bg-success-bg-alt",
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
                    : "bg-white border-hairline text-ink-muted hover:border-error/30 hover:bg-error-bg-alt",
                ].join(" ")}
              >
                {isPending ? "…" : "✕ 참석 못해요"}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
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
        <DeleteConfirm
          scheduleId={data.id}
          onClose={() => setShowDelete(false)}
        />
      )}
      {showReplace && (
        <ReplacePlaceConfirm
          scheduleId={schedule.id}
          roomCode={data.roomCode}
          onClose={() => setShowReplace(false)}
        />
      )}
      {showLeave && (
        <LeaveConfirm
          roomCode={data.roomCode}
          onClose={() => setShowLeave(false)}
        />
      )}
    </div>
  );
}

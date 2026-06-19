"use client";

import { Badge } from "@/app/components/ui/Badge";

/* ── 타입 — page.tsx의 ParticipantWithUser 기준 ────────────────────────── */

interface ParticipantUser {
  nickname: string;
  profileImage?: string | null;
}

interface ParticipantRow {
  id: string;
  userId: string;
  isHost: boolean;
  abstractLocation?: string | null;
  user: ParticipantUser;
}

interface WaitingParticipantSidebarProps {
  readonly participants: ParticipantRow[];
  readonly currentUserId: string | undefined;
  readonly locationSaved: boolean;
  readonly readyCount: number;
  readonly totalCount: number;
  readonly progress: number;
  readonly allReady: boolean;
  readonly onShowInvite: () => void;
}

/* ── 참가자별 아바타 ─────────────────────────────────────────────────────── */

function ParticipantAvatar({
  nickname,
  profileImage,
  isMe,
  isReady,
}: {
  nickname: string;
  profileImage?: string | null;
  isMe: boolean;
  isReady: boolean;
}) {
  const base =
    "w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold border shrink-0 overflow-hidden transition-all duration-300";

  if (profileImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profileImage}
        alt={nickname}
        className={[
          base,
          isReady ? "border-hairline" : "border-hairline opacity-60 grayscale",
        ].join(" ")}
      />
    );
  }
  return (
    <div
      className={[
        base,
        isMe
          ? "bg-accent-light text-accent border-accent/20"
          : isReady
          ? "bg-surface-3 text-ink-muted border-hairline"
          : "bg-surface-3 text-ink-subtle border-hairline opacity-60",
      ].join(" ")}
      aria-hidden="true"
    >
      {nickname.charAt(0)}
    </div>
  );
}

/* ── 준비 상태 인디케이터 ────────────────────────────────────────────────── */

function ReadyIndicator({ isReady }: { isReady: boolean }) {
  if (isReady) {
    return (
      <div className="flex items-center gap-1.5 text-success shrink-0" aria-label="선호 저장 완료">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7.5" fill="#E8F5EC" />
          <path
            d="M4.5 8L7 10.5L11.5 5.5"
            stroke="#27A644"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[11px] font-bold tracking-wide">저장됨</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-ink-subtle shrink-0" aria-label="선호 입력 대기 중">
      <span className="w-4 h-4 flex items-center justify-center" aria-hidden="true">
        <span
          className="w-[9px] h-[9px] rounded-full border-2 border-hairline-strong"
          style={{ animation: "waiting-dot 2s ease-in-out infinite" }}
        />
      </span>
      <span className="text-[11px] tracking-wide">대기 중</span>
    </div>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────────────────────────── */

export function WaitingParticipantSidebar({
  participants,
  currentUserId,
  locationSaved,
  readyCount,
  totalCount,
  progress,
  allReady,
  onShowInvite,
}: WaitingParticipantSidebarProps) {
  return (
    <div className="h-full overflow-y-auto flex flex-col bg-surface border-l border-hairline">
      {/* ── 헤더 ── */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-black text-ink tracking-tight">
            참가자
          </h3>
          {/* allReady 전환 시 뱃지 색상 변경 */}
          <span
            className={[
              "text-[11px] font-bold px-2 py-0.5 rounded-full border tracking-wide transition-colors duration-500",
              allReady
                ? "bg-success-bg text-success-text border-success/20"
                : "bg-surface-3 text-ink-subtle border-hairline",
            ].join(" ")}
          >
<<<<<<< HEAD
            {allReady ? "모두 준비됨" : `${totalCount}명`}
=======
            {allReady ? "모두 준비됨 ✓" : `${totalCount}명`}
>>>>>>> main
          </span>
        </div>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={readyCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${totalCount}명 중 ${readyCount}명 준비 완료`}
        >
          <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
            <div
              className={[
                "h-full rounded-full transition-all duration-700 ease-in-out",
                allReady ? "bg-success" : "bg-accent",
              ].join(" ")}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-[11px] text-ink-subtle mt-1.5">
          {readyCount}/{totalCount}명 선호 저장 완료
        </p>
      </div>

      <div className="h-px bg-hairline" aria-hidden="true" />

      {/* ── 참가자 목록 ── */}
      <ul className="px-3 py-3 flex flex-col gap-1.5 flex-1" role="list">
        {participants.map((p, idx) => {
          const isMe = p.userId === currentUserId;
          const isReady = isMe ? locationSaved : Boolean(p.abstractLocation);

          return (
            <li
              key={p.id}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isReady
<<<<<<< HEAD
                  ? "bg-surface border border-hairline hover:border-hairline-strong"
                  : "border border-transparent hover:bg-surface-2 opacity-75 hover:opacity-100",
=======
                  ? "bg-white border border-hairline hover:border-hairline-strong hover:shadow-xs"
                  : "border border-transparent hover:bg-surface-warm opacity-75 hover:opacity-100",
>>>>>>> main
              ].join(" ")}
              style={{ animation: `fade-up 0.35s ease-out ${idx * 0.05}s both` }}
            >
              <ParticipantAvatar
                nickname={p.user.nickname}
                profileImage={p.user.profileImage}
                isMe={isMe}
                isReady={isReady}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[13px] font-semibold text-ink truncate leading-tight">
                    {p.user.nickname}
                  </span>
                  {isMe && (
                    <span className="text-[10px] text-ink-subtle leading-tight" aria-label="(나)">
                      (나)
                    </span>
                  )}
                </div>
                {p.isHost && (
                  <div className="mt-0.5">
                    <Badge variant="accent">호스트</Badge>
                  </div>
                )}
              </div>

              <ReadyIndicator isReady={isReady} />
            </li>
          );
        })}
      </ul>

      <div className="h-px bg-hairline" aria-hidden="true" />

      {/* ── 하단: 초대 코드 버튼 ── */}
      <div className="px-4 py-4">
        <button
          onClick={onShowInvite}
          className={[
            "flex items-center justify-center gap-2 w-full rounded-xl border text-[13px] font-medium transition-all duration-150",
<<<<<<< HEAD
            "h-10 bg-surface-2 text-ink-muted border-hairline",
=======
            "h-10 bg-white text-ink-muted border-hairline",
>>>>>>> main
            "hover:bg-surface-3 hover:border-hairline-strong hover:text-ink",
            "active:scale-[0.98] active:bg-hairline",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
          ].join(" ")}
          aria-label="초대 코드 보기"
        >
<<<<<<< HEAD
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5.5 8.5l3-3M3.5 9L2 10.5A2 2 0 104.5 13L6 11.5M8 5l1.5-1.5A2 2 0 1112 6.5L10.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
=======
          <span aria-hidden="true">🔗</span>
>>>>>>> main
          초대 코드 보기
        </button>
      </div>
    </div>
  );
}

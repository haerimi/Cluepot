import React from "react";
import { Transport } from "@/types/participant";
import { Badge } from "@/app/components/ui/Badge";

/* ── 이동수단 아이콘 (미니 사이즈) ── */
const TRANSPORT_ICONS: Record<Transport, React.ReactNode> = {
  walk: (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
      <path d="M7.5 10l1-3 1.5 2 1.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 15l1-3 2 2 2-3 2.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  transit: (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4 9h12" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="7.5" cy="11.5" r="0.8" fill="currentColor"/>
      <circle cx="12.5" cy="11.5" r="0.8" fill="currentColor"/>
    </svg>
  ),
  car: (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 10l2-4h10l2 4v4H3v-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="6" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="14" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  bike: (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="13.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="14.5" cy="13.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 13.5L9 7h4l1.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function IconPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5A4.5 4.5 0 0112.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 018 1.5z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="6" r="1.5" fill="currentColor"/>
    </svg>
  );
}

interface ParticipantCardProps {
  readonly nickname: string;
  readonly isHost: boolean;
  readonly abstractLocation?: string;
  readonly transports?: Transport[];
  readonly isReady: boolean;
  readonly isMe?: boolean;
  readonly animationDelay?: string;
  readonly profileImage?: string | null;
}

export function ParticipantCard({
  nickname,
  isHost,
  abstractLocation,
  transports = [],
  isReady,
  isMe = false,
  animationDelay = "0s",
  profileImage,
}: ParticipantCardProps) {
  const initials = nickname.charAt(0);

  return (
    <div
      className={[
        "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
        isMe ? "bg-accent-light border-accent/30" : "bg-surface border-hairline",
      ].join(" ")}
      style={{ animation: `fade-up 0.35s ease-out ${animationDelay} both` }}
    >
      {/* Avatar */}
      <div
        className={[
          "w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 overflow-hidden",
          isMe ? "bg-accent text-white" : "bg-surface-3 text-ink-muted",
        ].join(" ")}
      >
        {profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profileImage} alt={nickname} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[14px] font-semibold text-ink truncate">
            {nickname}
          </span>
          {isMe && (
            <span className="text-[11px] text-ink-subtle">(나)</span>
          )}
          {isHost && <Badge variant="accent">호스트</Badge>}
        </div>

        {isReady && abstractLocation ? (
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[12px] text-ink-subtle flex items-center gap-1">
              <span className="text-ink-tertiary"><IconPin /></span>
              <span className="truncate">{abstractLocation}</span>
            </span>
            {transports.length > 0 && (
              <>
                <span className="text-ink-tertiary">·</span>
                <span className="flex items-center gap-0.5 text-ink-subtle">
                  {transports.map((t) => (
                    <span key={t}>{TRANSPORT_ICONS[t]}</span>
                  ))}
                </span>
              </>
            )}
          </div>
        ) : (
          <p className="text-[12px] text-ink-tertiary mt-0.5">위치 입력 대기중…</p>
        )}
      </div>

      {/* Status dot — pulses when pending, solid when ready */}
      <div className="shrink-0 relative flex items-center justify-center w-5 h-5">
        {!isReady && (
          <span
            className="absolute w-4 h-4 rounded-full bg-hairline-strong/50"
            style={{ animation: "waiting-dot 2s ease-in-out infinite" }}
          />
        )}
        <span
          className={[
            "relative w-2 h-2 rounded-full",
            isReady ? "bg-success" : "bg-hairline-strong",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

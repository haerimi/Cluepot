import { Transport } from "@/types/participant";
import { Badge } from "@/app/components/ui/Badge";

const TRANSPORT_LABELS: Record<Transport, string> = {
  walk: "도보",
  transit: "대중교통",
  car: "자가용",
  bike: "자전거",
};

const TRANSPORT_EMOJI: Record<Transport, string> = {
  walk: "🚶",
  transit: "🚇",
  car: "🚗",
  bike: "🚲",
};

interface ParticipantCardProps {
  readonly nickname: string;
  readonly isHost: boolean;
  readonly abstractLocation?: string;
  readonly transport?: Transport | null;
  readonly isReady: boolean;
  readonly isMe?: boolean;
  readonly animationDelay?: string;
}

export function ParticipantCard({
  nickname,
  isHost,
  abstractLocation,
  transport,
  isReady,
  isMe = false,
  animationDelay = "0s",
}: ParticipantCardProps) {
  const initials = nickname.charAt(0);

  return (
    <div
      className={[
        "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
        isMe ? "bg-accent-light border-accent/30" : "bg-white border-hairline",
      ].join(" ")}
      style={{ animation: `fade-up 0.35s ease-out ${animationDelay} both` }}
    >
      {/* Avatar */}
      <div
        className={[
          "w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0",
          isMe ? "bg-accent text-white" : "bg-surface-3 text-ink-muted",
        ].join(" ")}
      >
        {initials}
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
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-ink-subtle flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">{abstractLocation}</span>
            </span>
            {transport && (
              <>
                <span className="text-ink-tertiary">·</span>
                <span className="text-[12px] text-ink-subtle">
                  {TRANSPORT_EMOJI[transport]} {TRANSPORT_LABELS[transport]}
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

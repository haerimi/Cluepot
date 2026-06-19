"use client";

import { Button } from "@/app/components/ui/Button";

interface WaitingHostCenterProps {
  readonly readyCount: number;
  readonly totalCount: number;
  readonly allReady: boolean;
  readonly progress: number;
  readonly onRunPini: () => void;
  readonly onResetPreference: () => void;
}

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="10" cy="13.5" r="1" fill="currentColor"/>
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M11.5 2L5 11h6l-2.5 7 8-10h-6l3-6z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2A5 5 0 0115 7c0 4-5 11-5 11S5 11 5 7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="10" cy="7" r="1.8" fill="currentColor"/>
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1l1.5 5.5L16 8l-5.5 1.5L9 15l-1.5-5.5L2 8l5.5-1.5L9 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9l4.5 4.5L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const INFO_CARDS = [
  {
    Icon: IconLock,
    title: "선호 보호",
    desc: "각자의 출발지는 서로에게 공개되지 않아요",
  },
  {
    Icon: IconBolt,
    title: "실시간 동기화",
    desc: "참가자 준비 상태를 실시간으로 확인해요",
  },
  {
    Icon: IconPin,
    title: "중간지점 계산",
    desc: "이동 시간이 공평한 장소를 찾아드려요",
  },
] as const;

export function WaitingHostCenter({
  readyCount,
  totalCount,
  allReady,
  progress,
  onRunPini,
  onResetPreference,
}: WaitingHostCenterProps) {
  return (
    <div
      className="flex flex-col gap-6"
      style={{ animation: "fade-up 0.4s ease-out both" }}
    >
      {/* 세션 상태 배지 */}
      <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-success-bg border border-success/20">
        <span
          className="w-2 h-2 rounded-full bg-success shrink-0"
          style={{ animation: "waiting-dot 2s ease-in-out infinite" }}
          aria-hidden="true"
        />
        <span className="text-[11px] font-bold text-success-text tracking-[1.5px] uppercase">
          Live Session
        </span>
      </div>

      {/* 헤드라인 */}
      <div className="-mt-1">
        <h1 className="text-[26px] sm:text-[32px] font-black text-ink tracking-tight leading-[1.1] mb-2">
          모임 조율 중이에요
        </h1>
        <p className="text-[13px] sm:text-[14px] text-ink-muted leading-relaxed">
          참가자들이 선호를 입력하고 있어요. 모두 준비되면
          <br className="hidden sm:block" />
          {" "}PINI를 실행할 수 있어요.
        </p>
      </div>

      {/* 선호 저장 확인 배너 */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-success-bg rounded-xl border border-success/20"
        style={{ animation: "fade-up 0.35s ease-out 0.05s both" }}
      >
        <span className="shrink-0 w-7 h-7 rounded-full bg-success/20 flex items-center justify-center text-success-text"><IconCheck /></span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-success-text leading-tight">
            선호가 저장됐어요
          </p>
          <p className="text-[12px] text-success mt-0.5">
            모든 참가자가 준비되면 PINI를 실행할 수 있어요
          </p>
        </div>
        <button
          onClick={onResetPreference}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[12px] font-medium text-success-text hover:text-success hover:bg-success/10 rounded-lg transition-colors shrink-0 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
          aria-label="선호 수정"
        >
          수정
        </button>
      </div>

      {/* 참여 현황 카드 — allReady 시 테두리·그림자 전환 */}
      <div
        className={[
          "bg-surface rounded-2xl p-5 sm:p-6 transition-all duration-500",
          allReady
            ? "border border-success/30 shadow-[0_0_0_4px_rgba(39,166,68,0.07)]"
            : "border border-hairline shadow-xs",
        ].join(" ")}
        role="status"
        aria-live="polite"
        aria-label={`참여 현황: ${totalCount}명 중 ${readyCount}명 준비 완료`}
      >
        <div className="flex items-end justify-between mb-4">
          <span className="text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase">
            참여 현황
          </span>
          {/* 카운터 — allReady 시 accent → success 색상 전환 */}
          <div aria-hidden="true">
            <span
              className={[
                "text-[40px] font-black leading-none tabular-nums transition-colors duration-500",
                allReady ? "text-success" : "text-accent",
              ].join(" ")}
            >
              {readyCount}
            </span>
            <span className="text-[20px] font-semibold text-ink-subtle ml-1.5">
              / {totalCount}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full bg-surface-3 rounded-full overflow-hidden">
          <div
            className={[
              "h-full rounded-full transition-all duration-700 ease-in-out",
              allReady ? "bg-success" : "progress-shimmer",
            ].join(" ")}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={readyCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`${totalCount}명 중 ${readyCount}명 준비 완료`}
          />
        </div>

        <p className="text-[12px] text-ink-subtle mt-2.5 leading-relaxed">
          {allReady
            ? "모두 준비됐어요! PINI를 실행해주세요"
            : `${totalCount - readyCount}명이 아직 선호를 입력하지 않았어요`}
        </p>
      </div>

      {/* PINI 실행 CTA */}
      <div
        className="rounded-xl overflow-hidden"
        style={
          allReady
            ? { animation: "cta-glow 2.4s ease-in-out infinite" }
            : undefined
        }
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!allReady}
          onClick={onRunPini}
          aria-label={
            allReady
              ? "PINI 장소 추천 실행"
              : `참가자 대기 중 — ${readyCount}/${totalCount}명 준비 완료`
          }
        >
          {allReady ? (
            <>
              <IconSparkle />
              <span>PINI 실행하기</span>
            </>
          ) : (
            /* 비활성: 도트 바운스로 "대기 중" 시각화 */
            <>
              <span className="flex gap-[3px] shrink-0" aria-hidden="true">
                {([0, 0.15, 0.3] as const).map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-white/50"
                    style={{ animation: `dot-bounce 1.2s ease-in-out ${d}s infinite` }}
                  />
                ))}
              </span>
              <span>대기 중 ({readyCount}/{totalCount})</span>
            </>
          )}
        </Button>
      </div>

      {!allReady && (
        <p className="text-[12px] text-ink-subtle text-center -mt-2">
          모든 참가자가 선호를 저장하면 버튼이 활성화돼요
        </p>
      )}

      {/* 정보 카드 — 모바일: 가로 스크롤 스냅 / sm+: 3열 그리드 */}
      <div
        className="-mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto pb-1 sm:pb-0 snap-x snap-mandatory"
        aria-label="PINI 기능 안내"
        role="region"
      >
        <div className="flex gap-3 sm:grid sm:grid-cols-3 w-max sm:w-auto">
          {INFO_CARDS.map((card, i) => (
            <div
              key={card.title}
              className={[
                "w-[158px] sm:w-auto p-4 bg-surface border border-hairline rounded-xl text-left shrink-0 snap-start",
                "hover:border-hairline-strong hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-default",
              ].join(" ")}
              style={{ animation: `fade-up 0.4s ease-out ${0.15 + i * 0.07}s both` }}
            >
              <span className="mb-2.5 block text-ink-subtle" aria-hidden="true">
                <card.Icon />
              </span>
              <h4 className="text-[12px] font-bold text-ink mb-1">{card.title}</h4>
              <p className="text-[11px] text-ink-subtle leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

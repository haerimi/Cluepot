"use client";

import { DateAvailabilityPicker } from "@/app/components/DateAvailabilityPicker";
import { Button } from "@/app/components/ui/Button";

interface WaitingParticipantCenterProps {
  readonly myDates: string[];
  readonly dateSaved: boolean;
  readonly dateError: string | null;
  readonly onChangeDates: (dates: string[]) => void;
  readonly onSaveDates: () => void;
  readonly onResetDates: () => void;
  readonly onResetPreference: () => void;
}

export function WaitingParticipantCenter({
  myDates,
  dateSaved,
  dateError,
  onChangeDates,
  onSaveDates,
  onResetDates,
  onResetPreference,
}: WaitingParticipantCenterProps) {
  return (
    <div
      className="flex flex-col gap-5"
      style={{ animation: "fade-up 0.4s ease-out both" }}
    >
      {/* 체크 아이콘 + 완료 메시지 */}
      <div className="flex flex-col items-center text-center pt-4 sm:pt-6 pb-2">
        {/* 3중 레이어: expanding ring → pulsing border → 체크 원 */}
        {/* 부모 w-20 h-20 로 고정 — absolute ring이 inset-0 기준으로 확장 */}
        <div
          className="relative w-20 h-20 mb-5"
          role="img"
          aria-label="선호 저장 완료"
        >
          {/* Outermost expanding ring — inset-0 기준으로 scale 확장 후 fade */}
          <span
            className="absolute inset-0 rounded-full border-2 border-success/20"
            style={{ animation: "ring-pulse 2.8s ease-out infinite" }}
            aria-hidden="true"
          />
          {/* Pulsing middle ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-success/25 flex items-center justify-center"
            style={{ animation: "pulse-subtle 2.4s ease-in-out infinite" }}
            aria-hidden="true"
          >
            {/* Inner check circle */}
            <div className="w-[52px] h-[52px] rounded-full bg-success-bg shadow-[0_0_0_1px_rgba(39,166,68,0.1)] flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4.5 11L9 15.5L17.5 6.5"
                  stroke="#27A644"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-[24px] sm:text-[28px] font-black text-ink tracking-tight mb-2">
          선호가 저장됐어요!
        </h1>
        <p className="text-[13px] text-ink-muted leading-relaxed max-w-[260px] sm:max-w-xs">
          호스트가 PINI를 실행할 때까지 잠시만 기다려주세요.
        </p>

        {/* 선호 수정 버튼 — 체크 섹션 바로 아래, 항상 노출 */}
        <button
          onClick={onResetPreference}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-subtle hover:text-ink hover:bg-surface-2 px-3 py-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="선호 다시 입력하기"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M9 1.5L10.5 3L4.5 9H3V7.5L9 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          선호 수정하기
        </button>
      </div>

      {/* 호스트 대기 상태 카드 */}
      <div
        className="bg-surface border border-hairline rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3"
        role="status"
        aria-live="polite"
        aria-label="호스트가 참가자 선호를 확인하고 있습니다"
      >
        <div className="flex items-center gap-3">
          {/* 스피너를 아이콘 박스 안에 */}
          <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
            <span
              className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin block"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[11px] font-bold text-ink-subtle tracking-[1.5px] uppercase leading-none mb-0.5">
              호스트 상태
            </p>
            <p className="text-[13px] font-medium text-ink leading-tight">
              참가자 선호 확인 중...
            </p>
          </div>
        </div>
        {/* 기술 뱃지 — 시각적 흥미 요소, 스크린 리더에는 숨김 */}
        <span
          className="text-[10px] font-mono font-bold text-accent bg-accent-light px-2 py-1 rounded-md border border-accent/20 shrink-0 select-none"
          aria-hidden="true"
        >
          PINI_WAIT
        </span>
      </div>

      {/* 날짜 — 저장됨 / 선택 */}
      {dateSaved ? (
        /* 날짜 저장됨 배너 */
        <div
          className="flex items-center gap-3 px-4 py-3.5 bg-accent-light rounded-xl border border-accent/20"
          style={{ animation: "fade-up 0.3s ease-out both" }}
        >
          <div className="w-9 h-9 rounded-xl bg-surface-2/50 flex items-center justify-center shrink-0 text-accent">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 7h12" stroke="currentColor" strokeWidth="1.4"/><path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-accent leading-tight">
              날짜가 저장됐어요!
            </p>
            <p className="text-[12px] text-accent-muted mt-0.5 truncate">
              {myDates.map((d) => d.slice(5).replace("-", "/")).join(" · ")}
            </p>
          </div>
          {/* 터치 타겟 최소 44px 확보 */}
          <button
            onClick={onResetDates}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[12px] font-medium text-accent hover:text-accent-hover hover:bg-accent/10 rounded-lg transition-colors shrink-0 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="날짜 수정"
          >
            수정
          </button>
        </div>
      ) : (
        /* 날짜 선택 카드 */
        <div
          className="bg-surface border border-hairline rounded-2xl p-5 space-y-4"
          style={{ animation: "fade-up 0.3s ease-out both" }}
        >
          <div>
            <p className="text-[13px] font-semibold text-ink mb-0.5">
              가능한 날짜 선택
            </p>
            <p className="text-[12px] text-ink-subtle">
              최대 5일 · PINI가 겹치는 날짜를 추천해드려요
            </p>
          </div>
          <DateAvailabilityPicker value={myDates} onChange={onChangeDates} />
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onSaveDates}
            aria-label={
              myDates.length > 0
                ? `선택한 ${myDates.length}개 날짜 저장`
                : "날짜 저장하기"
            }
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 7h12" stroke="currentColor" strokeWidth="1.4"/><path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            날짜 저장하기
          </Button>
          {dateError && (
            <p className="text-[12px] text-error flex items-center gap-1.5" role="alert">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1L15 14H1L8 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.8" fill="currentColor"/></svg>
              {dateError}
            </p>
          )}
        </div>
      )}

    </div>
  );
}

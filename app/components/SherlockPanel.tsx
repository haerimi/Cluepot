"use client";

import { useEffect, useState } from "react";
import { RecommendedPlace } from "@/types/recommendation";
import { PlaceCard } from "@/app/components/PlaceCard";

export type { RecommendedPlace };

type PanelState = "loading" | "done";

interface SherlockPanelProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly places: RecommendedPlace[];
  readonly selectedPlaceId: string | null;
  readonly onSelectPlace: (place: RecommendedPlace) => void;
  readonly onRegenerate: () => void;
  readonly onConfirm?: () => void;
  readonly isLoading?: boolean;
  readonly participantCount?: number;
}

const ANALYSIS_STEPS = [
  "후보 장소 리뷰 수집 중…",
  "광고성 후기 필터링 중…",
  "실제 방문자 경험 추출 중…",
  "참가자 이동 균형 계산 중…",
  "신뢰도 기반 추천 목록 완성 중…",
] as const;

const RADAR_NODES = [
  { style: { top: "4px", left: "50%", transform: "translateX(-50%)" }, delay: "0s" },
  { style: { right: "4px", top: "50%", transform: "translateY(-50%)" }, delay: "0.5s" },
  { style: { bottom: "4px", left: "50%", transform: "translateX(-50%)" }, delay: "1s" },
  { style: { left: "4px", top: "50%", transform: "translateY(-50%)" }, delay: "1.5s" },
] as const;

const SUMMARY_CHIPS = [
  { emoji: "🔍", label: "리뷰 신뢰도 검증" },
  { emoji: "🚫", label: "광고 후기 필터" },
  { emoji: "⚖️", label: "이동 균형화" },
] as const;

function getProgressDotColor(index: number, current: number): string {
  return index <= current ? "#7C5CFC" : "#E5E1D9";
}

function getProgressDotWidth(index: number, current: number): string {
  return index === current ? "20px" : "8px";
}

/* ── Radar scanner — enlarged on desktop ── */
function RadarScanner() {
  return (
    <div className="relative mx-auto w-36 h-36 lg:w-52 lg:h-52">
      <div className="absolute inset-0 rounded-full border border-[#7C5CFC]/20 bg-[#F0ECFF]/40" />
      <div className="absolute inset-5 rounded-full border border-[#7C5CFC]/15" />
      <div className="absolute inset-10 rounded-full border border-[#7C5CFC]/10" />

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, transparent 72%, rgba(124,92,252,0.18) 88%, rgba(124,92,252,0.05) 100%)",
          animation: "sherlock-scan 2s linear infinite",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-[#7C5CFC] flex items-center justify-center"
          style={{
            boxShadow: "0 0 32px rgba(124,92,252,0.45), 0 2px 8px rgba(124,92,252,0.3)",
            animation: "float-slow 3s ease-in-out infinite",
          }}
        >
          <span className="text-[22px] lg:text-[32px] leading-none select-none">🔍</span>
        </div>
      </div>

      {RADAR_NODES.map((node) => (
        <div
          key={node.delay}
          className="absolute w-2.5 h-2.5 rounded-full bg-[#7C5CFC]"
          style={{
            ...node.style,
            animation: `node-pulse 2s ease-in-out ${node.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

function AnalysisSummaryStrip({ count }: { count: number }) {
  return (
    <div
      className="rounded-xl p-4 mb-5"
      style={{
        background: "linear-gradient(135deg, #FFF8F4 0%, #F0ECFF 100%)",
        border: "1px solid rgba(124,92,252,0.15)",
        animation: "fade-up 0.4s ease-out both",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[14px]">✓</span>
        <p className="text-[14px] font-bold text-[#1C1A17]">분석 완료</p>
      </div>
      <p className="text-[12px] text-[#908D87] leading-relaxed mb-3">
        실제 방문자 후기를 검증하고 {count}명의 이동 균형을 함께 고려했어요
      </p>
      <div className="flex gap-2 flex-wrap">
        {SUMMARY_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full border border-[#7C5CFC]/20 text-[11px] font-medium text-[#7C5CFC]"
          >
            {chip.emoji} {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SherlockPanel({
  open,
  onClose,
  places,
  selectedPlaceId,
  onSelectPlace,
  onRegenerate,
  onConfirm,
  isLoading = false,
  participantCount = 3,
}: SherlockPanelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>("loading");
  const [stepKey, setStepKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    if (isLoading) {
      setPanelState("loading");
      setStepIndex(0);
      setStepKey((k) => k + 1);
    } else if (places.length > 0) {
      setPanelState("done");
    }
  }, [open, isLoading, places]);

  useEffect(() => {
    if (panelState !== "loading") return;
    if (stepIndex >= ANALYSIS_STEPS.length - 1) return;
    const t = setTimeout(() => {
      setStepIndex((i) => i + 1);
      setStepKey((k) => k + 1);
    }, 700);
    return () => clearTimeout(t);
  }, [panelState, stepIndex]);

  if (!open) return null;

  const showConfirm = panelState === "done" && !!selectedPlaceId && !!onConfirm;

  return (
    <>
      {/* ── Backdrop ── */}
      <button
        type="button"
        aria-label="닫기"
        className="fixed inset-0 z-40 w-full h-full bg-[#1C1A17]/30 backdrop-blur-[4px] cursor-default"
        onClick={onClose}
      />

      {/* ── Panel: bottom sheet on mobile, centered modal on desktop ── */}
      <div
        className={[
          /* shared */
          "fixed z-50 bg-[#F4F2EE] flex flex-col",
          /* mobile: bottom sheet */
          "bottom-0 left-0 right-0 rounded-t-[24px] max-h-[88dvh]",
          /* desktop: centered modal */
          "lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2",
          "lg:-translate-x-1/2 lg:-translate-y-1/2",
          "lg:w-full lg:max-w-3xl lg:max-h-[85vh] lg:rounded-2xl",
        ].join(" ")}
        style={{
          boxShadow: "0 -8px 48px rgba(28,26,23,0.16), 0 -2px 8px rgba(28,26,23,0.08)",
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-2 shrink-0 lg:hidden">
          <div className="w-10 h-1 rounded-full bg-[#D0CCC4]" />
        </div>

        {/* Panel header */}
        <div className="flex items-center justify-between px-5 lg:px-8 pt-4 lg:pt-6 pb-4 shrink-0 border-b border-[#E5E1D9]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] lg:text-[20px]">🔍</span>
              <h2 className="text-[18px] lg:text-[20px] font-black text-[#1C1A17] tracking-tight">
                Sherlock Mode
              </h2>
              {panelState === "loading" && (
                <div className="flex gap-[3px] ml-1">
                  {([0, 0.15, 0.3] as const).map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]"
                      style={{ animation: `dot-bounce 1.2s ease-in-out ${d}s infinite` }}
                    />
                  ))}
                </div>
              )}
            </div>
            {panelState === "done" && (
              <p
                className="text-[12px] text-[#908D87] mt-0.5"
                style={{ animation: "fade-up 0.3s ease-out both" }}
              >
                {places.length}개 장소 — 모두를 위한 추천
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0EDE7] text-[#908D87] hover:bg-[#E5E1D9] transition-colors"
            aria-label="닫기"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-5 lg:py-6">

          {/* ── Loading: Radar scanner ── */}
          {panelState === "loading" && (
            <div className="flex flex-col items-center py-10 lg:py-16 gap-8 lg:gap-12">
              <RadarScanner />

              <div className="text-center min-h-10">
                <p
                  key={stepKey}
                  className="text-[14px] lg:text-[16px] font-semibold text-[#1C1A17]"
                  style={{ animation: "step-in 0.35s ease-out both" }}
                >
                  {ANALYSIS_STEPS[stepIndex]}
                </p>
                <p
                  className="text-[12px] lg:text-[13px] text-[#908D87] mt-1.5"
                  style={{ animation: "text-shimmer 1.8s ease-in-out infinite" }}
                >
                  신뢰할 수 있는 장소만 추천해드릴게요
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                {ANALYSIS_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: getProgressDotWidth(i, stepIndex),
                      height: "8px",
                      backgroundColor: getProgressDotColor(i, stepIndex),
                      opacity: i <= stepIndex ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Done: Summary + Place list ── */}
          {panelState === "done" && (
            <div>
              <AnalysisSummaryStrip count={participantCount} />

              {/* Place cards — 1-col mobile, 2-col on large desktop */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {places.map((place, i) => (
                  <div
                    key={place.placeId}
                    style={{ animation: `fade-up 0.35s ease-out ${i * 0.09}s both` }}
                  >
                    <PlaceCard
                      placeName={place.placeName}
                      placeAddress={place.placeAddress}
                      category={place.category}
                      rating={place.rating}
                      fairnessScore={place.fairnessScore}
                      balanceTag={place.balanceTag}
                      reasoning={place.reasoning}
                      perParticipantTime={[...place.perParticipantTime]}
                      atmosphereMatch={place.atmosphereMatch}
                      reviewIntelligence={place.reviewIntelligence}
                      isSelected={selectedPlaceId === place.placeId}
                      onSelect={() => onSelectPlace(place)}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={onRegenerate}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-[#D0CCC4] text-[13px] font-medium text-[#908D87] hover:border-[#7C5CFC] hover:text-[#7C5CFC] hover:bg-[#F0ECFF] transition-all duration-200 mt-4"
                style={{
                  animation: `fade-up 0.35s ease-out ${places.length * 0.09 + 0.06}s both`,
                }}
              >
                <span>🔄</span>
                다른 추천 보기
              </button>
            </div>
          )}
        </div>

        {/* ── Confirm footer — shown when place selected ── */}
        {showConfirm && (
          <div
            className="shrink-0 px-5 lg:px-8 pb-5 lg:pb-6 pt-3 border-t border-[#E5E1D9] bg-[#F4F2EE]"
            style={{ animation: "fade-up 0.25s ease-out both" }}
          >
            <button
              type="button"
              onClick={onConfirm}
              className="w-full h-[52px] rounded-[10px] bg-[#7C5CFC] text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#6B4AEF] active:bg-[#5A38E3] shadow-[0_1px_3px_rgba(124,92,252,0.3)] hover:shadow-[0_2px_8px_rgba(124,92,252,0.35)] transition-all duration-150"
            >
              ✓ 이 장소로 정하기
            </button>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/room";
import { PlaceCard, BalanceTag, PerParticipantTime } from "@/app/components/PlaceCard";

export interface RecommendedPlace {
  readonly placeId: string;
  readonly placeName: string;
  readonly placeAddress: string;
  readonly category: Category;
  readonly rating?: number;
  readonly lat: number;
  readonly lng: number;
  readonly fairnessScore: number;
  readonly balanceTag: BalanceTag;
  readonly reasoning: string;
  readonly perParticipantTime: PerParticipantTime[];
  readonly atmosphereMatch: string;
}

type PanelState = "loading" | "done";

interface SherlockPanelProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly places: RecommendedPlace[];
  readonly selectedPlaceId: string | null;
  readonly onSelectPlace: (place: RecommendedPlace) => void;
  readonly onRegenerate: () => void;
  readonly isLoading?: boolean;
  readonly participantCount?: number;
}

const ANALYSIS_STEPS = [
  "각 참가자 이동 패턴 분석 중…",
  "공정한 중간 지점 탐색 중…",
  "분위기 선호도 조율 중…",
  "이동 부담 최소화 경로 산출 중…",
  "공정성 기반 추천 목록 생성 중…",
] as const;

const RADAR_NODES = [
  { style: { top: "4px", left: "50%", transform: "translateX(-50%)" }, delay: "0s" },
  { style: { right: "4px", top: "50%", transform: "translateY(-50%)" }, delay: "0.5s" },
  { style: { bottom: "4px", left: "50%", transform: "translateX(-50%)" }, delay: "1s" },
  { style: { left: "4px", top: "50%", transform: "translateY(-50%)" }, delay: "1.5s" },
] as const;

const SUMMARY_CHIPS = [
  { emoji: "⚖️", label: "이동 균형화" },
  { emoji: "🎭", label: "분위기 조율" },
  { emoji: "📍", label: "경로 최적화" },
] as const;

function getProgressDotColor(index: number, current: number): string {
  return index <= current ? "#7C5CFC" : "#E5E1D9";
}

function getProgressDotWidth(index: number, current: number): string {
  return index === current ? "20px" : "8px";
}

function RadarScanner() {
  return (
    <div className="relative mx-auto w-36 h-36">
      <div className="absolute inset-0 rounded-full border border-accent/20 bg-accent-light/40" />
      <div className="absolute inset-5 rounded-full border border-accent/15" />
      <div className="absolute inset-10 rounded-full border border-accent/10" />

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
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center"
          style={{
            boxShadow: "0 0 24px rgba(124,92,252,0.45), 0 2px 8px rgba(124,92,252,0.3)",
            animation: "float-slow 3s ease-in-out infinite",
          }}
        >
          <span className="text-[22px] leading-none select-none">🔍</span>
        </div>
      </div>

      {RADAR_NODES.map((node) => (
        <div
          key={node.delay}
          className="absolute w-2.5 h-2.5 rounded-full bg-accent"
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
      className="rounded-xl p-4 mb-4"
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
        {count}명의 이동 패턴·분위기 선호를 함께 고려해 추천했어요
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

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="닫기"
        className="fixed inset-0 z-40 w-full h-full bg-ink/25 backdrop-blur-[3px] cursor-default"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[430px]
          bg-canvas rounded-t-[24px] flex flex-col max-h-[88dvh]"
        style={{ boxShadow: "0 -12px 48px rgba(28,26,23,0.18), 0 -2px 8px rgba(28,26,23,0.08)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-hairline-strong" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px]">🔍</span>
              <h2 className="text-[18px] font-black text-ink tracking-tight">
                Sherlock Mode
              </h2>
              {panelState === "loading" && (
                <div className="flex gap-[3px] ml-1">
                  {([0, 0.15, 0.3] as const).map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                      style={{ animation: `dot-bounce 1.2s ease-in-out ${d}s infinite` }}
                    />
                  ))}
                </div>
              )}
            </div>
            {panelState === "done" && (
              <p
                className="text-[12px] text-ink-subtle mt-0.5"
                style={{ animation: "fade-up 0.3s ease-out both" }}
              >
                {places.length}개 장소 — 모두를 위한 추천
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-3 text-ink-subtle hover:bg-hairline transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M1 1L12 12M12 1L1 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">

          {/* ── Loading: Radar scanner ── */}
          {panelState === "loading" && (
            <div className="flex flex-col items-center py-10 gap-8">
              <RadarScanner />

              <div className="text-center min-h-10">
                <p
                  key={stepKey}
                  className="text-[14px] font-semibold text-ink"
                  style={{ animation: "step-in 0.35s ease-out both" }}
                >
                  {ANALYSIS_STEPS[stepIndex]}
                </p>
                <p
                  className="text-[12px] text-ink-subtle mt-1"
                  style={{ animation: "text-shimmer 1.8s ease-in-out infinite" }}
                >
                  참가자 모두를 위한 균형점을 찾고 있어요
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

              <div className="space-y-3">
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
                      isSelected={selectedPlaceId === place.placeId}
                      onSelect={() => onSelectPlace(place)}
                    />
                  </div>
                ))}

                <button
                  onClick={onRegenerate}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-hairline-strong text-[13px] font-medium text-ink-subtle hover:border-accent hover:text-accent hover:bg-accent-light transition-all duration-200 mt-1"
                  style={{
                    animation: `fade-up 0.35s ease-out ${places.length * 0.09 + 0.06}s both`,
                  }}
                >
                  <span>🔄</span>
                  다른 추천 보기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

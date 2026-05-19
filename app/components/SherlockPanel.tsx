"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/room";
import { PlaceCard } from "@/app/components/PlaceCard";

interface RecommendedPlace {
  readonly placeId: string;
  readonly placeName: string;
  readonly placeAddress: string;
  readonly category: Category;
  readonly rating?: number;
  readonly avgMinutes?: number;
  readonly distance?: string;
  readonly lat: number;
  readonly lng: number;
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
}

const ANALYSIS_STEPS = [
  "참가자 위치 불러오는 중…",
  "이동 경로 계산 중…",
  "중간 지점 탐색 중…",
  "주변 장소 평가 중…",
  "추천 목록 생성 중…",
] as const;

const RADAR_NODES = [
  { style: { top: "4px", left: "50%", transform: "translateX(-50%)" }, delay: "0s" },
  { style: { right: "4px", top: "50%", transform: "translateY(-50%)" }, delay: "0.5s" },
  { style: { bottom: "4px", left: "50%", transform: "translateX(-50%)" }, delay: "1s" },
  { style: { left: "4px", top: "50%", transform: "translateY(-50%)" }, delay: "1.5s" },
] as const;

function getProgressDotColor(index: number, current: number): string {
  return index <= current ? "#FF5C00" : "#E5E1D9";
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

      {/* Rotating conic sweep */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, transparent 72%, rgba(255,92,0,0.18) 88%, rgba(255,92,0,0.05) 100%)",
          animation: "sherlock-scan 2s linear infinite",
        }}
      />

      {/* Center orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-14 h-14 rounded-full bg-accent flex items-center justify-center"
          style={{
            boxShadow: "0 0 24px rgba(255,92,0,0.45), 0 2px 8px rgba(255,92,0,0.3)",
            animation: "float-slow 3s ease-in-out infinite",
          }}
        >
          <span className="text-[22px] leading-none select-none">🔍</span>
        </div>
      </div>

      {/* Cardinal-point node dots */}
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

export function SherlockPanel({
  open,
  onClose,
  places,
  selectedPlaceId,
  onSelectPlace,
  onRegenerate,
  isLoading = false,
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
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-107.5
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
                <div className="flex gap-0.75 ml-1">
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
                {places.length}개의 장소를 추천해드려요
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
                  AI가 최적 장소를 탐색하고 있어요
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

          {/* ── Done: Place list ── */}
          {panelState === "done" && (
            <div className="space-y-3">
              {places.map((place, i) => (
                <div
                  key={place.placeId}
                  style={{ animation: `fade-up 0.35s ease-out ${i * 0.08}s both` }}
                >
                  <PlaceCard
                    placeName={place.placeName}
                    placeAddress={place.placeAddress}
                    category={place.category}
                    rating={place.rating}
                    avgMinutes={place.avgMinutes}
                    distance={place.distance}
                    isSelected={selectedPlaceId === place.placeId}
                    onSelect={() => onSelectPlace(place)}
                    rank={i + 1}
                  />
                </div>
              ))}

              <button
                onClick={onRegenerate}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-hairline-strong text-[13px] font-medium text-ink-subtle hover:border-accent hover:text-accent hover:bg-accent-light transition-all duration-200 mt-1"
                style={{ animation: `fade-up 0.35s ease-out ${places.length * 0.08 + 0.05}s both` }}
              >
                <span>🔄</span>
                다른 추천 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

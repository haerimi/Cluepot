"use client";

/**
 * PiniPanel — two rendering modes
 *
 * variant="modal"  (default)
 *   Fixed backdrop + positioned panel. Bottom-sheet on mobile,
 *   centred modal on desktop. Controlled by the `open` prop.
 *
 * variant="inline"
 *   Normal flex column filling its parent. No backdrop, no close button,
 *   no fixed positioning. Used by the desktop right-pane in the room page
 *   grid; the layout controls visibility by mounting/unmounting this
 *   component when `hasResults` becomes true. The `open` prop is ignored.
 *
 * Loading state:
 *   Replaces the radar/scanner animation with PiniTypographicLoader —
 *   a slowly cycling Korean sentence + a single sweeping bar.
 *   Tone: calm, editorial, confident. Not sci-fi, not a checklist.
 */

import { useEffect, useState } from "react";
import { RecommendedPlace } from "@/types/recommendation";
import { PlaceCard } from "@/app/components/PlaceCard";

export type { RecommendedPlace };

type PanelVariant = "modal" | "inline";
type PanelState = "loading" | "done" | "error";

interface PiniPanelProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly places: RecommendedPlace[];
  readonly selectedPlaceId: string | null;
  readonly onSelectPlace: (place: RecommendedPlace) => void;
  readonly onRegenerate: () => void;
  readonly onConfirm?: () => void;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly participantCount?: number;
  readonly variant?: PanelVariant;
}

/* ─────────────────────────────────────────────
   Typographic loader — replaces RadarScanner
───────────────────────────────────────────── */

const PINI_THOUGHTS = [
  "모두의 이동을 균형 있게 맞추고 있어요",
  "광고성 후기를 걸러내고 있어요",
  "검증된 방문자 경험을 읽고 있어요",
  "최선의 장소를 고르는 중이에요",
] as const;

function PiniTypographicLoader() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setShow(false), 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (show) return;
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % PINI_THOUGHTS.length);
      setShow(true);
    }, 300);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-10 py-20">
      <div className="text-center w-full max-w-2xl px-4">
        <p className="text-[10px] font-bold text-accent tracking-[2.5px] uppercase mb-5">
          PINI
        </p>
        <p
          className="text-[20px] lg:text-[24px] font-light text-ink leading-snug tracking-tight break-keep"
          style={{ opacity: show ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          {PINI_THOUGHTS[idx]}
        </p>
      </div>

      {/* Sweeping bar — not a progress meter, just ambient motion */}
      <div className="w-32 h-px bg-hairline relative overflow-hidden">
        <div
          className="absolute inset-y-0 w-10 bg-accent/50 rounded-full"
          style={{ animation: "pini-progress 2.2s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Analysis summary — single prose line, no chips
───────────────────────────────────────────── */

interface AnalysisSummaryProps {
  readonly count: number;
}

function AnalysisSummary({ count }: AnalysisSummaryProps) {
  return (
    <div
      className="mb-7"
      style={{ animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <p className="text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-2">
        PINI 추천
      </p>
      <p className="text-[14px] text-ink-muted leading-relaxed">
        실제 방문자 후기와 <span className="text-ink font-semibold">{count}명의 이동</span>을 균형 있게 고려한 장소예요
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared scrollable content (loading or results)
───────────────────────────────────────────── */

interface PanelContentProps {
  readonly panelState: PanelState;
  readonly places: RecommendedPlace[];
  readonly selectedPlaceId: string | null;
  readonly onSelectPlace: (place: RecommendedPlace) => void;
  readonly onRegenerate: () => void;
  readonly participantCount: number;
  readonly errorMessage?: string | null;
}

function PanelContent({
  panelState,
  places,
  selectedPlaceId,
  onSelectPlace,
  onRegenerate,
  participantCount,
  errorMessage,
}: PanelContentProps) {
  return (
    <>
      {panelState === "loading" && <PiniTypographicLoader />}

      {panelState === "error" && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-10 py-20 text-center">
          <p className="text-[32px]" aria-hidden="true">😵</p>
          <p className="text-[15px] font-semibold text-ink">추천 중 오류가 발생했어요</p>
          <p className="text-[13px] text-ink-subtle leading-relaxed">
            {errorMessage ?? 'AI 서버가 일시적으로 바쁜 것 같아요.'}
          </p>
          <button
            onClick={onRegenerate}
            className="mt-2 px-5 py-2.5 rounded-xl bg-accent text-white text-[13px] font-semibold
                       hover:bg-accent/90 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      )}

      {panelState === "done" && (
        <div className="px-5 lg:px-8 py-6">
          <AnalysisSummary count={participantCount} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-ful">
            {places.map((place, i) => (
              <div
                key={place.placeId}
                style={{
                  animation: `fade-up 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`,
                }}
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
            className="w-full flex items-center justify-center gap-2 py-3.5 mt-5 rounded-xl
                       border border-dashed border-hairline-strong text-[13px] font-medium text-ink-subtle
                       hover:border-accent hover:text-accent hover:bg-accent-light
                       transition-all duration-200"
            style={{
              animation: `fade-up 0.4s cubic-bezier(0.16,1,0.3,1) ${places.length * 0.1 + 0.1}s both`,
            }}
          >
            <span aria-hidden="true">↺</span>
            다른 추천 보기
          </button>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   Confirm bar — shared by both variants
───────────────────────────────────────────── */

interface ConfirmBarProps {
  readonly onConfirm: () => void;
  readonly padded?: boolean;
}

function ConfirmBar({ onConfirm, padded = false }: ConfirmBarProps) {
  return (
    <div
      className={[
        "shrink-0 border-t border-hairline bg-canvas",
        padded ? "px-8 pb-7 pt-4" : "px-5 lg:px-8 pb-5 lg:pb-6 pt-3",
      ].join(" ")}
      style={{ animation: "fade-up 0.25s ease-out both" }}
    >
      <button
        type="button"
        onClick={onConfirm}
        className="w-full h-13 rounded-[10px] bg-accent text-white text-[15px] font-semibold
                   flex items-center justify-center gap-2
                   hover:bg-accent-hover active:bg-[#5A38E3]
                   shadow-[0_1px_3px_rgba(124,92,252,0.3)]
                   hover:shadow-[0_2px_8px_rgba(124,92,252,0.35)]
                   transition-all duration-150"
      >
        ✓ 이 장소로 정하기
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */

export function PiniPanel({
  open,
  onClose,
  places,
  selectedPlaceId,
  onSelectPlace,
  onRegenerate,
  onConfirm,
  isLoading = false,
  error = null,
  participantCount = 3,
  variant = "modal",
}: PiniPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>("loading");
  const [resetKey, setResetKey] = useState(0);

  const isActive = variant === "inline" ? true : open;

  useEffect(() => {
    if (!isActive) return;
    if (isLoading) {
      setPanelState("loading");
      setResetKey((k) => k + 1);
    } else if (error) {
      setPanelState("error");
    } else if (places.length > 0) {
      setPanelState("done");
    }
  }, [isActive, isLoading, error, places]);

  const showConfirm = panelState === "done" && !!selectedPlaceId && !!onConfirm;

  /* ── Inline variant ────────────────────────── */
  if (variant === "inline") {
    return (
      <div className="flex flex-col h-full bg-canvas">
        <div className="flex items-center gap-2.5 px-8 pt-7 pb-5 border-b border-hairline shrink-0">
          <h2 className="text-[16px] font-black text-ink tracking-tight">
            PINI
          </h2>
          {panelState === "loading" && (
            <div className="flex gap-0.75 ml-1" aria-label="분석 중">
              {([0, 0.2, 0.4] as const).map((d) => (
                <div
                  key={d}
                  className="w-1 h-1 rounded-full bg-accent/60"
                  style={{ animation: `dot-bounce 1.4s ease-in-out ${d}s infinite` }}
                />
              ))}
            </div>
          )}
          {panelState === "done" && (
            <p
              className="text-[12px] text-ink-subtle ml-1"
              style={{ animation: "fade-up 0.3s ease-out both" }}
            >
              {places.length}개 장소 추천됨
            </p>
          )}
        </div>

        <div key={resetKey} className="flex-1 overflow-y-auto flex flex-col">
          <PanelContent
            panelState={panelState}
            places={places}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={onSelectPlace}
            onRegenerate={onRegenerate}
            participantCount={participantCount}
            errorMessage={error}
          />
        </div>

        {showConfirm && <ConfirmBar onConfirm={onConfirm} padded />}
      </div>
    );
  }

  /* ── Modal variant ─────────────────────────── */
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        className="fixed inset-0 z-40 w-full h-full bg-ink/30 backdrop-blur-xs cursor-default"
        onClick={onClose}
      />

      <div
        className={[
          "fixed z-50 bg-canvas flex flex-col",
          "bottom-0 left-0 right-0 rounded-t-[24px] max-h-[88dvh]",
          "lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2",
          "lg:-translate-x-1/2 lg:-translate-y-1/2",
          "lg:w-full lg:max-w-2xl lg:max-h-[85vh] lg:rounded-2xl",
        ].join(" ")}
        style={{
          boxShadow: "0 -8px 48px rgba(28,26,23,0.16), 0 -2px 8px rgba(28,26,23,0.08)",
        }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0 lg:hidden">
          <div className="w-10 h-1 rounded-full bg-hairline-strong" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 lg:px-8 pt-4 lg:pt-6 pb-4 shrink-0 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-black text-ink tracking-tight">
                PINI
              </h2>
              {panelState === "loading" && (
                <div className="flex gap-0.75 ml-1" aria-label="분석 중">
                  {([0, 0.2, 0.4] as const).map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                      style={{ animation: `dot-bounce 1.4s ease-in-out ${d}s infinite` }}
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
            className="w-8 h-8 flex items-center justify-center rounded-full
                       bg-surface-3 text-ink-subtle hover:bg-hairline transition-colors"
            aria-label="닫기"
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

        <div key={resetKey} className="flex-1 overflow-y-auto flex flex-col">
          <PanelContent
            panelState={panelState}
            places={places}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={onSelectPlace}
            onRegenerate={onRegenerate}
            participantCount={participantCount}
            errorMessage={error}
          />
        </div>

        {showConfirm && <ConfirmBar onConfirm={onConfirm} />}
      </div>
    </>
  );
}

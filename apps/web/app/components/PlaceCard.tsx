"use client";

/**
 * PlaceCard — editorial hierarchy (desktop-first)
 *
 * New reading order:
 *   1. Place identity   — name large, category + rating small
 *   2. PINI voice   — reasoning is the PRIMARY section, not a footnote
 *   3. Travel balance   — clean per-person rows, no badge overload
 *   4. Detail drawer    — ReviewIntelligence + fairness score collapsed by default
 *
 * What was removed from the default view:
 *   - BalanceTag chip cluster (kept as a single subtle label)
 *   - FairnessScore percentage in the footer
 *   - AnalysisSummaryStrip (moved to PiniPanel level)
 *   - Left-border accent box around reasoning (now open prose)
 *
 * Whitespace increased throughout; chip density reduced.
 */

import { useState } from "react";
import { Category } from "@/types/room";
import { BalanceTag, PerParticipantTime, ReviewIntelligence } from "@/types/recommendation";
import { Transport } from "@/types/participant";

/* ── Lookup maps ─────────────────────────────────────────────────────── */

const CATEGORY_LABEL: Record<Category, string> = {
  restaurant: "맛집",
  cafe:       "카페",
  bar:        "술집",
  brunch:     "브런치",
  dessert:    "디저트",
};

const CATEGORY_EMOJI: Record<Category, string> = {
  restaurant: "🍽",
  cafe:       "☕",
  bar:        "🍺",
  brunch:     "🥂",
  dessert:    "🍰",
};

const TRANSPORT_EMOJI: Record<Transport, string> = {
  walk:    "🚶",
  transit: "🚇",
  car:     "🚗",
  bike:    "🚲",
};

const BALANCE_TAG_LABEL: Record<BalanceTag, string> = {
  most_balanced:  "이동 균형",
  review_pick:    "후기 신뢰",
  closest_to_all: "접근성 우수",
  best_vibe:      "분위기 최적",
  quickest:       "최단 이동",
};

/* ── Props ───────────────────────────────────────────────────────────── */

interface PlaceCardProps {
  readonly placeName: string;
  readonly placeAddress: string;
  readonly category: Category;
  readonly rating?: number;
  readonly isSelected?: boolean;
  readonly onSelect: () => void;
  readonly fairnessScore: number;
  readonly balanceTag: BalanceTag;
  readonly reasoning: string;
  readonly perParticipantTime: PerParticipantTime[];
  readonly atmosphereMatch: string;
  readonly reviewIntelligence: ReviewIntelligence;
  readonly animationDelay?: string;
}

/* ── Sub-components ──────────────────────────────────────────────────── */

interface TravelRowsProps {
  readonly times: PerParticipantTime[];
}

function TravelRows({ times }: Readonly<TravelRowsProps>) {
  const minutes  = times.map((p) => p.minutes);
  const timeDiff = Math.max(...minutes) - Math.min(...minutes);

  let diffColor = "text-ink-subtle";
  if (timeDiff <= 5)       diffColor = "text-success";
  else if (timeDiff <= 12) diffColor = "text-warning";

  let diffText = `이동 시간 차이 ${timeDiff}분`;
  if (timeDiff <= 5)       diffText = `${timeDiff}분 차이 — 균등해요`;
  else if (timeDiff <= 12) diffText = `최대 ${timeDiff}분 차이`;

  return (
    <div>
      <p className="text-[10px] font-bold text-ink-tertiary tracking-[1.5px] uppercase mb-3">
        참가자별 이동
      </p>
      <div className="space-y-2 mb-3">
        {times.map((p) => (
          <div key={p.nickname} className="flex items-center gap-2">
            <span className="text-[13px] w-5 text-center" aria-hidden="true">
              {TRANSPORT_EMOJI[p.transport]}
            </span>
            <span className="text-[13px] font-medium text-ink-muted flex-1">
              {p.nickname}
            </span>
            <span className="text-[13px] font-semibold text-ink tabular-nums">
              {p.minutes}분
            </span>
          </div>
        ))}
      </div>
      <p className={["text-[11px] font-medium", diffColor].join(" ")}>
        {diffText}
      </p>
    </div>
  );
}

interface DetailDrawerProps {
  readonly intelligence: ReviewIntelligence;
  readonly fairnessScore: number;
  readonly atmosphereMatch: string;
  readonly balanceTag: BalanceTag;
  readonly isSelected: boolean;
}

function DetailDrawer({
  intelligence,
  fairnessScore,
  atmosphereMatch,
  balanceTag,
  isSelected,
}: Readonly<DetailDrawerProps>) {
  const [open, setOpen] = useState(false);

  let scoreColor = "text-ink-subtle";
  if (fairnessScore >= 90)      scoreColor = "text-success";
  else if (fairnessScore >= 75) scoreColor = "text-warning";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-ink-subtle
                   hover:text-ink transition-colors py-1"
        aria-expanded={open}
      >
        <span
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          ↓
        </span>
        {open ? "접기" : "후기 · 상세 보기"}
      </button>

      {open && (
        <div
          className="mt-4 space-y-4"
          style={{ animation: "card-expand 0.2s ease-out both" }}
        >
          {/* Review intelligence */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: isSelected ? "rgba(114,152,199,0.04)" : "#F7F6F2",
              border: `1px solid ${isSelected ? "rgba(114,152,199,0.12)" : "#EAE7DF"}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-accent tracking-[1.5px] uppercase">
                PINI 리뷰 분석
              </span>
              <span className="text-[10px] font-semibold bg-accent-light text-accent px-2 py-0.5 rounded-full">
                검증 후기 {intelligence.authenticCount}개
              </span>
            </div>

            {(intelligence.pros ?? []).length > 0 && (
              <div className={(intelligence.cons ?? []).length > 0 ? "mb-3" : ""}>
                <p className="text-[10px] font-bold text-success tracking-wide mb-2">좋은 점</p>
                <ul className="space-y-1.5">
                  {(intelligence.pros ?? []).map((pro) => (
                    <li key={pro} className="flex items-start gap-2">
                      <span className="text-[10px] text-success mt-0.75 shrink-0 font-bold">✓</span>
                      <span className="text-[12px] text-ink-muted leading-[1.6]">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(intelligence.cons ?? []).length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-warning tracking-wide mb-2">참고할 점</p>
                <ul className="space-y-1.5">
                  {(intelligence.cons ?? []).map((con) => (
                    <li key={con} className="flex items-start gap-2">
                      <span className="text-[10px] text-warning mt-0.75 shrink-0">△</span>
                      <span className="text-[12px] text-ink-muted leading-[1.6]">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Metrics row — inside the drawer, not the card default view */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={["text-[12px] font-bold tabular-nums", scoreColor].join(" ")}>
              균형도 {fairnessScore}%
            </span>
            <span className="text-ink-tertiary text-[11px]">·</span>
            <span className="text-[11px] text-ink-subtle">{atmosphereMatch}</span>
            <span className="text-ink-tertiary text-[11px]">·</span>
            <span className="text-[11px] text-ink-subtle">
              {BALANCE_TAG_LABEL[balanceTag]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PlaceCard ───────────────────────────────────────────────────────── */

export function PlaceCard({
  placeName,
  placeAddress,
  category,
  rating,
  isSelected = false,
  onSelect,
  fairnessScore,
  balanceTag,
  reasoning,
  perParticipantTime,
  atmosphereMatch,
  reviewIntelligence,
  animationDelay = "0s",
}: PlaceCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border transition-all duration-200 overflow-hidden",
        "flex flex-col h-full justify-between",
        isSelected
          ? "bg-accent-light border-accent shadow-[0_0_0_1px_#7298C7,0_4px_16px_rgba(114,152,199,0.12)]"
          : "bg-white border-hairline shadow-[0_1px_4px_rgba(26,32,51,0.06)] hover:border-hairline-strong hover:shadow-[0_4px_16px_rgba(26,32,51,0.08)]",
      ].join(" ")}
      style={{ animationDelay }}
    >
      <div className="p-5 lg:p-6 space-y-5">

        {/* ── 1. Place identity ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-ink-subtle">
              {CATEGORY_EMOJI[category]} {CATEGORY_LABEL[category]}
            </span>
            {rating !== undefined && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-ink-muted">
                <span className="text-star">★</span>
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="text-[20px] lg:text-[22px] font-black text-ink leading-snug tracking-tight mb-1">
            {placeName}
          </h3>
          <p className="text-[12px] text-ink-subtle truncate">{placeAddress}</p>
        </div>

        <div className="h-px bg-hairline" />

        {/* ── 2. PINI voice — primary section ── */}
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-accent tracking-[1.5px] uppercase mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-butter shrink-0" />{"피니가 선택한 이유"}
          </p>
          <p
            className="text-[14px] text-ink-muted leading-[1.8]"
            style={{ animation: `reason-in 0.4s ease-out ${animationDelay} both` }}
          >
            {reasoning}
          </p>
        </div>

        <div className="h-px bg-hairline" />

        {/* ── 3. Travel balance ── */}
        <TravelRows times={perParticipantTime} />

        <div className="h-px bg-hairline" />

        {/* ── 4. Expandable detail drawer ── */}
        <DetailDrawer
          intelligence={reviewIntelligence}
          fairnessScore={fairnessScore}
          atmosphereMatch={atmosphereMatch}
          balanceTag={balanceTag}
          isSelected={isSelected}
        />
      </div>

      {/* Select CTA — full-width footer */}
      <button
        type="button"
        onClick={onSelect}
        className={[
          "w-full h-12 text-[14px] font-semibold transition-all duration-150",
          "flex items-center justify-center gap-2",
          isSelected
            ? "bg-accent text-white"
            : "bg-canvas text-ink-muted hover:bg-surface-warm",
        ].join(" ")}
      >
        {isSelected ? "✓ 선택됨" : "이 장소 선택하기"}
      </button>
    </div>
  );
}

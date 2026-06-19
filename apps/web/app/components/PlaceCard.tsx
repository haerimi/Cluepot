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

import React, { useState } from "react";
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

/* ── 카테고리 SVG 아이콘 (미니) ── */
const CATEGORY_SVG: Record<Category, React.ReactNode> = {
  restaurant: <svg width="13" height="13" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M7 2v5c0 1.66 1.34 3 3 3h.5v10h1.5v-10H12c1.66 0 3-1.34 3-3V2h-1.5v4h-1V2H11v4h-1V2H7z" fill="currentColor"/></svg>,
  cafe:       <svg width="13" height="13" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M5 6h10v7a4 4 0 01-4 4H9a4 4 0 01-4-4V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M15 8h2a2 2 0 010 4h-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  bar:        <svg width="13" height="13" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M3 4h16l-6 8v6h2v2H7v-2h2v-6L3 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  brunch:     <svg width="13" height="13" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  dessert:    <svg width="13" height="13" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 3c-4.5 0-7 3-7 5h14c0-2-2.5-5-7-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M4 8v1a7 7 0 0014 0V8" stroke="currentColor" strokeWidth="1.5"/></svg>,
};

/* ── 이동수단 SVG 아이콘 (미니) ── */
const TRANSPORT_SVG: Record<Transport, React.ReactNode> = {
  walk:    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="4" r="1.5" fill="currentColor"/><path d="M7.5 10l1-3 1.5 2 1.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  transit: <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M4 9h12" stroke="currentColor" strokeWidth="1.4"/><circle cx="7.5" cy="11.5" r="0.8" fill="currentColor"/><circle cx="12.5" cy="11.5" r="0.8" fill="currentColor"/></svg>,
  car:     <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10l2-4h10l2 4v4H3v-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="6" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="14" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
  bike:    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="5.5" cy="13.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="14.5" cy="13.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 13.5L9 7h4l1.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
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
  const timeDiff = minutes.length === 0 ? 0 : Math.max(...minutes) - Math.min(...minutes);

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
            <span className="w-5 flex items-center justify-center text-ink-subtle shrink-0" aria-hidden="true">
              {TRANSPORT_SVG[p.transport]}
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

interface DrawerContentProps {
  readonly intelligence: ReviewIntelligence;
  readonly atmosphereMatch: string;
  readonly balanceTag: BalanceTag;
  readonly isSelected: boolean;
}

function DrawerContent({
  intelligence,
  atmosphereMatch,
  balanceTag,
  isSelected,
}: Readonly<DrawerContentProps>) {

  return (
    <div
      className="mt-3 space-y-4"
      style={{ animation: "card-expand 0.2s ease-out both" }}
    >
      {/* Review intelligence */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: isSelected ? "rgba(94,106,210,0.06)" : "#141516",
          border: `1px solid ${isSelected ? "rgba(94,106,210,0.15)" : "#23252a"}`,
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

      {/* Metrics row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[11px] text-ink-subtle">{atmosphereMatch}</span>
        <span className="text-ink-tertiary text-[11px]">·</span>
        <span className="text-[11px] text-ink-subtle">
          {BALANCE_TAG_LABEL[balanceTag]}
        </span>
      </div>
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
  const [open, setOpen] = useState(false);

  let scoreColor = "text-ink-subtle";
  if (fairnessScore >= 90)      scoreColor = "text-success";
  else if (fairnessScore >= 75) scoreColor = "text-warning";

  return (
    <div
      className={[
        "rounded-2xl border transition-all duration-200 overflow-hidden",
        "flex flex-col h-full justify-between",
        isSelected
          ? "bg-accent-light border-accent shadow-[0_0_0_1px_#5e6ad2]"
          : "bg-surface border-hairline hover:border-hairline-strong",
      ].join(" ")}
      style={{ animationDelay }}
    >
      <div className="p-5 lg:p-6 space-y-5">

        {/* ── 1. Place identity ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1 text-[11px] text-ink-subtle">
              <span className="text-ink-tertiary">{CATEGORY_SVG[category]}</span>
              {CATEGORY_LABEL[category]}
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

          {/* fairnessScore + toggle — below place identity */}
          <div className="mt-3">
            <span className={["text-[13px] font-bold tabular-nums", scoreColor].join(" ")}>
              균형도 {fairnessScore}%
            </span>
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-ink-subtle
                           hover:text-ink transition-colors py-0.5"
                aria-expanded={open}
              >
                <svg
                  width="11" height="11" viewBox="0 0 11 11" fill="none"
                  className="transition-transform duration-200"
                  style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                  aria-hidden="true"
                >
                  <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {open ? "접기" : "후기 · 상세 보기"}
              </button>
            </div>

            {open && (
              <DrawerContent
                intelligence={reviewIntelligence}
                atmosphereMatch={atmosphereMatch}
                balanceTag={balanceTag}
                isSelected={isSelected}
              />
            )}
          </div>
        </div>

        <div className="h-px bg-hairline" />

        {/* ── 2. PINI voice — primary section ── */}
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-accent tracking-[1.5px] uppercase mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-muted shrink-0" />{"피니가 선택한 이유"}
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
            : "bg-canvas text-ink-muted hover:bg-surface-2",
        ].join(" ")}
      >
        {isSelected ? (
          <>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M1.5 6.5L5 10L11.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            선택됨
          </>
        ) : "이 장소 선택하기"}
      </button>
    </div>
  );
}

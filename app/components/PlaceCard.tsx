"use client";

import { Category } from "@/types/room";
import {
  BalanceTag,
  PerParticipantTime,
  ReviewIntelligence,
} from "@/types/recommendation";

const CATEGORY_LABELS: Record<Category, string> = {
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

import { Transport } from "@/types/participant";

const TRANSPORT_EMOJI: Record<Transport, string> = {
  walk:    "🚶",
  transit: "🚇",
  car:     "🚗",
  bike:    "🚲",
};

const BALANCE_TAG_CONFIG: Record<
  BalanceTag,
  { label: string; emoji: string; bg: string; text: string }
> = {
  most_balanced:  { label: "가장 균형적",    emoji: "⚖️", bg: "#F0ECFF", text: "#7C5CFC" },
  review_pick:    { label: "후기 신뢰 높음", emoji: "🔍", bg: "#F0ECFF", text: "#7C5CFC" },
  closest_to_all: { label: "모두에게 가까운", emoji: "📍", bg: "#F0EDE7", text: "#4A4740" },
  best_vibe:      { label: "분위기 최적",    emoji: "✨", bg: "#F0EDE7", text: "#4A4740" },
  quickest:       { label: "최단 이동",      emoji: "⚡", bg: "#F0EDE7", text: "#4A4740" },
};

interface PlaceCardProps {
  placeName: string;
  placeAddress: string;
  category: Category;
  rating?: number;
  isSelected?: boolean;
  onSelect: () => void;
  fairnessScore: number;
  balanceTag: BalanceTag;
  reasoning: string;
  perParticipantTime: PerParticipantTime[];
  atmosphereMatch: string;
  reviewIntelligence: ReviewIntelligence;
  animationDelay?: string;
}

function FairnessScore({ score }: { score: number }) {
  const color = score >= 90 ? "#27A644" : score >= 75 ? "#D97706" : "#908D87";
  return (
    <span
      className="text-[12px] font-bold tabular-nums"
      style={{ color, animation: "score-appear 0.4s ease-out 0.2s both" }}
    >
      균형도 {score}%
    </span>
  );
}

function ReviewSection({
  intelligence,
  isSelected,
}: {
  intelligence: ReviewIntelligence;
  isSelected: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{
        backgroundColor: isSelected ? "rgba(124,92,252,0.04)" : "#F7F6F2",
        border: "1px solid",
        borderColor: isSelected ? "rgba(124,92,252,0.12)" : "#EAE7DF",
        animation: "fade-up 0.3s ease-out both",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-[#7C5CFC] tracking-[1.5px] uppercase">
          Sherlock 리뷰 분석
        </span>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: "#F0ECFF", color: "#7C5CFC" }}
        >
          검증 후기 {intelligence.authenticCount}개
        </span>
      </div>

      {/* Pros */}
      <div className={intelligence.cons.length > 0 ? "mb-3" : ""}>
        <p className="text-[10px] font-bold text-[#27A644] tracking-wide mb-2">좋은 점</p>
        <ul className="space-y-1.5">
          {intelligence.pros.map((pro) => (
            <li key={pro} className="flex items-start gap-2">
              <span className="text-[10px] text-[#27A644] mt-[3px] shrink-0 font-bold">✓</span>
              <span className="text-[12px] text-[#4A4740] leading-[1.6]">{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons — framed as helpful notes, not warnings */}
      {intelligence.cons.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[#D97706] tracking-wide mb-2">참고할 점</p>
          <ul className="space-y-1.5">
            {intelligence.cons.map((con) => (
              <li key={con} className="flex items-start gap-2">
                <span className="text-[10px] text-[#D97706] mt-[3px] shrink-0">△</span>
                <span className="text-[12px] text-[#4A4740] leading-[1.6]">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
  const tagConfig = BALANCE_TAG_CONFIG[balanceTag];
  const times = perParticipantTime.map((p) => p.minutes);
  const timeDiff = Math.max(...times) - Math.min(...times);

  return (
    <div
      className={[
        "rounded-2xl border transition-all duration-200 overflow-hidden",
        isSelected
          ? "bg-[#F0ECFF] border-[#7C5CFC] shadow-[0_0_0_1px_#7C5CFC,0_4px_16px_rgba(124,92,252,0.12)]"
          : "bg-white border-[#E5E1D9] shadow-[0_1px_4px_rgba(28,26,23,0.06)] hover:border-[#D0CCC4] hover:shadow-[0_4px_16px_rgba(28,26,23,0.08)]",
      ].join(" ")}
      style={{ animationDelay }}
    >
      {/* Card body */}
      <div className="p-5">
        {/* Header row: category · balance tag · rating */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[12px] text-[#908D87]">
            {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category]}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: tagConfig.bg, color: tagConfig.text }}
          >
            {tagConfig.emoji} {tagConfig.label}
          </span>
          {rating !== undefined && (
            <span className="ml-auto flex items-center gap-1 text-[12px] font-medium text-[#4A4740]">
              <span className="text-[#F59E0B]">★</span>
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Place identity */}
        <h3 className="text-[18px] font-black text-[#1C1A17] leading-snug mb-1 tracking-tight">
          {placeName}
        </h3>
        <p className="text-[12px] text-[#908D87] mb-4 truncate">{placeAddress}</p>

        {/* Thin separator */}
        <div className="h-px bg-[#E5E1D9] mb-4" />

        {/* Review intelligence (primary Sherlock value) */}
        <ReviewSection intelligence={reviewIntelligence} isSelected={isSelected} />

        {/* Sherlock coordination reasoning */}
        <div
          className="flex gap-3 p-4 rounded-xl mb-4"
          style={{
            backgroundColor: isSelected ? "rgba(124,92,252,0.06)" : "#F4F2EE",
            border: "1px solid",
            borderColor: isSelected ? "rgba(124,92,252,0.2)" : "#E5E1D9",
            animation: `reason-in 0.4s ease-out ${animationDelay} both`,
          }}
        >
          <div className="w-[3px] rounded-full bg-[#7C5CFC] shrink-0 self-stretch" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#7C5CFC] tracking-[1.5px] uppercase mb-1.5">
              조율 이유
            </p>
            <p className="text-[12px] text-[#4A4740] leading-[1.7]">{reasoning}</p>
          </div>
        </div>

        {/* Per-participant travel times */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-[#C4C1BC] tracking-[1.5px] uppercase mb-2.5">
            참가자별 이동 시간
          </p>
          <div className="flex flex-wrap gap-1.5">
            {perParticipantTime.map((p) => (
              <div
                key={p.nickname}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F0EDE7] rounded-lg"
              >
                <span className="text-[11px]">{TRANSPORT_EMOJI[p.transport]}</span>
                <span className="text-[11px] font-semibold text-[#4A4740]">{p.nickname}</span>
                <span className="text-[11px] text-[#908D87]">{p.minutes}분</span>
              </div>
            ))}
          </div>

          {/* Balance indicator */}
          <div className="flex items-center gap-2 mt-2.5">
            <span
              className={[
                "w-1.5 h-1.5 rounded-full shrink-0",
                timeDiff <= 5
                  ? "bg-[#27A644]"
                  : timeDiff <= 12
                  ? "bg-[#D97706]"
                  : "bg-[#C4C1BC]",
              ].join(" ")}
            />
            <span
              className={[
                "text-[11px] font-medium",
                timeDiff <= 5
                  ? "text-[#27A644]"
                  : timeDiff <= 12
                  ? "text-[#D97706]"
                  : "text-[#908D87]",
              ].join(" ")}
            >
              {timeDiff <= 5
                ? `이동 시간 균등 (차이 ${timeDiff}분 이내)`
                : timeDiff <= 12
                ? `이동 시간 소폭 차이 (${timeDiff}분)`
                : `이동 시간 차이 있음 (${timeDiff}분)`}
            </span>
          </div>
        </div>

        {/* Footer: fairness score · atmosphere match */}
        <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-[#E5E1D9]">
          <FairnessScore score={fairnessScore} />
          <span className="text-[#D0CCC4]">·</span>
          <span className="text-[11px] text-[#908D87] leading-tight">{atmosphereMatch}</span>
        </div>
      </div>

      {/* Select CTA — full-width footer button */}
      <button
        type="button"
        onClick={onSelect}
        className={[
          "w-full h-12 text-[14px] font-semibold transition-all duration-150 flex items-center justify-center gap-2",
          isSelected
            ? "bg-[#7C5CFC] text-white"
            : "bg-[#F4F2EE] text-[#4A4740] hover:bg-[#EEECE6]",
        ].join(" ")}
      >
        {isSelected ? "✓ 선택됨" : "이 장소 선택하기"}
      </button>
    </div>
  );
}

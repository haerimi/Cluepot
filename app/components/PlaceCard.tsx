"use client";

import { Category } from "@/types/room";
import { Button } from "@/app/components/ui/Button";

const CATEGORY_LABELS: Record<Category, string> = {
  restaurant: "맛집",
  cafe: "카페",
  bar: "술집",
  brunch: "브런치",
  dessert: "디저트",
};

const CATEGORY_EMOJI: Record<Category, string> = {
  restaurant: "🍽",
  cafe: "☕",
  bar: "🍺",
  brunch: "🥂",
  dessert: "🍰",
};

interface PlaceCardProps {
  placeName: string;
  placeAddress: string;
  category: Category;
  rating?: number;
  avgMinutes?: number;
  distance?: string;
  isSelected?: boolean;
  onSelect: () => void;
  rank?: number;
}

export function PlaceCard({
  placeName,
  placeAddress,
  category,
  rating,
  avgMinutes,
  distance,
  isSelected = false,
  onSelect,
  rank,
}: PlaceCardProps) {
  return (
    <div
      className={[
        "rounded-xl border p-4 transition-all duration-200",
        isSelected
          ? "bg-[#FFF0E8] border-[#FF5C00] shadow-[0_0_0_1px_#FF5C00]"
          : "bg-white border-[#E5E1D9] shadow-[0_1px_3px_rgba(28,26,23,0.08)]",
      ].join(" ")}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {rank && rank <= 3 && (
            <span className="text-[13px] font-bold text-[#FF5C00] min-w-[18px]">
              #{rank}
            </span>
          )}
          <span className="text-[13px] text-[#908D87]">
            {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category]}
          </span>
        </div>
        {rating && (
          <span className="flex items-center gap-1 text-[13px] font-medium text-[#4A4740]">
            <span className="text-[#F59E0B]">★</span>
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Place name */}
      <h3 className="text-[17px] font-bold text-[#1C1A17] leading-snug mb-1">
        {placeName}
      </h3>
      <p className="text-[13px] text-[#908D87] leading-snug mb-3 truncate">
        {placeAddress}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4">
        {avgMinutes !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#F0EDE7] flex items-center justify-center text-[11px]">
              🕐
            </span>
            <span className="text-[12px] text-[#4A4740] font-medium">
              평균 {avgMinutes}분
            </span>
          </div>
        )}
        {distance && (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#F0EDE7] flex items-center justify-center text-[11px]">
              📍
            </span>
            <span className="text-[12px] text-[#4A4740] font-medium">
              {distance}
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <Button
        variant={isSelected ? "primary" : "secondary"}
        size="md"
        fullWidth
        onClick={onSelect}
      >
        {isSelected ? "✓ 선택됨" : "이 장소 선택하기"}
      </Button>
    </div>
  );
}

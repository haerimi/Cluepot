"use client";

import { Category } from "@/types/room";

interface CategoryOption {
  value: Category;
  label: string;
  emoji: string;
  desc: string;
}

const CATEGORIES: CategoryOption[] = [
  { value: "restaurant", label: "맛집",   emoji: "🍽", desc: "식사 모임" },
  { value: "cafe",       label: "카페",   emoji: "☕", desc: "가볍게 차 한잔" },
  { value: "bar",        label: "술집",   emoji: "🍺", desc: "술 한잔 하는 자리" },
  { value: "brunch",     label: "브런치", emoji: "🥂", desc: "여유로운 낮 모임" },
  { value: "dessert",    label: "디저트", emoji: "🍰", desc: "달콤한 시간" },
];

interface CategoryPickerProps {
  readonly value: Category | null;
  readonly onChange: (category: Category) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map((cat, idx) => {
        const isSelected = value === cat.value;
        /* 홀수 개 항목일 때 마지막 항목이 혼자 남아 반쪽만 차지하지 않도록 2열 스팬 */
        const isAloneInRow =
          idx === CATEGORIES.length - 1 && CATEGORIES.length % 2 !== 0;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={[
              "relative flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              isSelected
                ? "bg-accent-light border-accent shadow-[0_0_0_1px_#7298C7]"
                : "bg-white border-hairline hover:border-hairline-strong hover:bg-surface-2",
              isAloneInRow ? "col-span-2" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="text-2xl leading-none">{cat.emoji}</span>
            <span
              className={[
                "text-[15px] font-semibold leading-tight mt-1",
                isSelected ? "text-accent" : "text-ink",
              ].join(" ")}
            >
              {cat.label}
            </span>
            <span className="text-[12px] text-ink-subtle leading-tight">
              {cat.desc}
            </span>
            {isSelected && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 3.5L3.8 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

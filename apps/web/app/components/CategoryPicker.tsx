"use client";

import { Category } from "@/types/room";

<<<<<<< HEAD
/* ── 카테고리별 인라인 SVG 아이콘 ── */
function IconRestaurant() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M7 2v5c0 1.66 1.34 3 3 3h.5v10h1.5v-10H12c1.66 0 3-1.34 3-3V2h-1.5v4h-1V2H11v4h-1V2H7z" fill="currentColor"/>
    </svg>
  );
}
function IconCafe() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5 6h10v7a4 4 0 01-4 4H9a4 4 0 01-4-4V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M15 8h2a2 2 0 010 4h-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M4 20h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconBar() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3 4h16l-6 8v6h2v2H7v-2h2v-6L3 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function IconBrunch() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconDessert() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 3c-4.5 0-7 3-7 5h14c0-2-2.5-5-7-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M4 8v1a7 7 0 0014 0V8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 18h6M11 9v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, React.FC> = {
  restaurant: IconRestaurant,
  cafe: IconCafe,
  bar: IconBar,
  brunch: IconBrunch,
  dessert: IconDessert,
};

=======
>>>>>>> main
export interface CategoryOption {
  value: Category;
  label: string;
  desc: string;
}

export const CATEGORIES: CategoryOption[] = [
<<<<<<< HEAD
  { value: "restaurant", label: "맛집",   desc: "식사 모임" },
  { value: "cafe",       label: "카페",   desc: "가볍게 차 한잔" },
  { value: "bar",        label: "술집",   desc: "술 한잔 하는 자리" },
  { value: "brunch",     label: "브런치", desc: "여유로운 낮 모임" },
  { value: "dessert",    label: "디저트", desc: "달콤한 시간" },
=======
  { value: "restaurant", label: "맛집",   emoji: "🍽", desc: "식사 모임" },
  { value: "cafe",       label: "카페",   emoji: "☕", desc: "가볍게 차 한잔" },
  { value: "bar",        label: "술집",   emoji: "🍺", desc: "술 한잔 하는 자리" },
  { value: "brunch",     label: "브런치", emoji: "🥂", desc: "여유로운 낮 모임" },
  { value: "dessert",    label: "디저트", emoji: "🍰", desc: "달콤한 시간" },
>>>>>>> main
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
        const Icon = CATEGORY_ICONS[cat.value];
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={[
              "relative flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              "active:scale-[0.98]",
              isSelected
<<<<<<< HEAD
                ? "bg-accent-light border-accent shadow-[0_0_0_1px_#5e6ad2]"
                : "bg-surface border-hairline hover:border-hairline-strong hover:bg-surface-2",
=======
                ? "bg-accent-light border-accent shadow-[0_0_0_1px_#7298C7]"
                : "bg-white border-hairline hover:border-hairline-strong hover:bg-surface",
>>>>>>> main
              isAloneInRow ? "col-span-2" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={isSelected ? "text-accent" : "text-ink-subtle"}>
              <Icon />
            </span>
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
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
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

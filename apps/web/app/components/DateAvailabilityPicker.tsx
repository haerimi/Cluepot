"use client";

import React from "react";

const MAX_DATES = 5;
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface DateAvailabilityPickerProps {
  value: string[];
  onChange: (dates: string[]) => void;
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DateAvailabilityPicker({
  value,
  onChange,
}: DateAvailabilityPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);

  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  const selected = new Set(value);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const canGoPrev = (() => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    return prev >= new Date(today.getFullYear(), today.getMonth(), 1);
  })();

  const canGoNext = (() => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    return next <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  })();

  function handlePrev() {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNext() {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleDayClick(day: number) {
    const key = toDateKey(viewYear, viewMonth, day);
    const date = new Date(viewYear, viewMonth, day);

    if (date < today || date > maxDate) return;

    if (selected.has(key)) {
      onChange(value.filter((d) => d !== key));
    } else {
      if (selected.size >= MAX_DATES) return;
      onChange([...value, key].sort());
    }
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full select-none">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="이전 달"
<<<<<<< HEAD
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-2 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
=======
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
>>>>>>> main
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <span className="text-[14px] font-semibold text-ink">
          {viewYear}년 {viewMonth + 1}월
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="다음 달"
<<<<<<< HEAD
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-2 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
=======
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
>>>>>>> main
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-medium text-ink-subtle py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const key = toDateKey(viewYear, viewMonth, day);
          const date = new Date(viewYear, viewMonth, day);
          const isSelected = selected.has(key);
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();
          const isDisabled =
            date < today ||
            date > maxDate ||
            (!isSelected && selected.size >= MAX_DATES);

          return (
            <div key={key} className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={isDisabled}
                className={[
                  "w-10 h-10 sm:w-7 sm:h-7 rounded-full text-[13px] font-medium transition-all duration-150 mt-1",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                  "active:scale-[0.94]",
                  isSelected
                    ? "bg-accent text-white shadow-[0_0_0_2px_#5e6ad2]"
                    : isToday
                      ? "border border-accent text-accent hover:bg-accent-light hover:shadow-sm"
                      : isDisabled
                        ? "text-ink-subtle opacity-30 cursor-not-allowed"
<<<<<<< HEAD
                        : "text-ink hover:bg-surface-2",
=======
                        : "text-ink hover:bg-white hover:shadow-sm",
>>>>>>> main
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      {/* 선택 카운트 */}
      <div className="mt-3 text-right text-[12px] text-ink-subtle">
        {selected.size} / {MAX_DATES}개 선택됨
      </div>
    </div>
  );
}

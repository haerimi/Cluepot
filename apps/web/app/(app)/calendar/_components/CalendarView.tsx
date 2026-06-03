"use client";

import { useEffect, useMemo, useState, startTransition } from "react";
import Link from "next/link";
import type { ScheduleListItem } from "@/app/actions/schedule";

/* ── Date helpers ─────────────────────────────────────────────────────────── */

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
] as const;

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCalendarCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const cells: Date[] = [];

  // Pad from Sunday of the week containing the 1st
  for (let i = 0; i < first.getDay(); i++) {
    cells.push(new Date(year, month, 1 - (first.getDay() - i)));
  }
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  // Pad to complete 6 rows (42 cells)
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    cells.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return cells;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? "오전" : "오후";
  const hour   = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const min    = String(m).padStart(2, "0");
  return `${period} ${hour}:${min}`;
}

function formatSelectedDate(year: number, month: number, day: number) {
  const d = new Date(year, month, day);
  return d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

/* ── Status chip ─────────────────────────────────────────────────────────── */

function StatusChip({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success-text bg-success-bg px-2 py-0.5 rounded-full">
        수락
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-error bg-error-bg px-2 py-0.5 rounded-full">
        거절
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-subtle bg-surface-3 px-2 py-0.5 rounded-full">
      보류
    </span>
  );
}

/* ── Schedule card ───────────────────────────────────────────────────────── */

function ScheduleCard({
  schedule,
  index,
}: {
  schedule: ScheduleListItem;
  index: number;
}) {
  return (
    <Link
      href={`/calendar/${schedule.id}`}
      className="group block"
      style={{ animation: `fade-up 0.3s ease-out ${index * 0.06}s both` }}
    >
      <div className="flex items-start gap-4 py-4 px-5 bg-white rounded-xl border border-hairline
                      hover:border-accent/40 hover:shadow-md transition-all duration-200">
        {/* Time column */}
        <div className="shrink-0 w-16 text-right">
          <p className="text-[11px] font-semibold text-ink-subtle leading-tight">
            {formatTime(schedule.scheduledAt)}
          </p>
        </div>

        {/* Divider dot */}
        <div className="shrink-0 flex flex-col items-center pt-1.5 gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <div className="w-px flex-1 bg-hairline" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-ink leading-tight mb-0.5 truncate group-hover:text-accent transition-colors">
            {schedule.title}
          </p>
          <p className="text-[12px] text-ink-subtle truncate">{schedule.placeName}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-ink-tertiary">
              {schedule.memberCount}명
            </span>
            <StatusChip status={schedule.myStatus} />
          </div>
        </div>

        {/* Arrow */}
        <div className="shrink-0 text-ink-tertiary group-hover:text-accent transition-colors pt-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/* ── Empty state for selected date ──────────────────────────────────────── */

function DateEmptyState() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center mb-4">
        <span className="text-[18px] leading-none select-none">—</span>
      </div>
      <p className="text-[13px] text-ink-subtle leading-relaxed">이 날은 예정된 일정이 없어요</p>
    </div>
  );
}

/* ── Month empty state ───────────────────────────────────────────────────── */

function MonthEmptyState() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center mb-5"
        style={{ animation: "float-slow 3s ease-in-out infinite" }}
      >
        <span className="text-[26px] leading-none select-none">📅</span>
      </div>
      <h3 className="text-[16px] font-bold text-ink mb-1">이달의 일정이 없어요</h3>
      <p className="text-[13px] text-ink-subtle leading-relaxed mb-7 max-w-[200px]">
        모임을 만들고 피니로 장소를 확정하면 여기에 기록돼요
      </p>
      <Link
        href="/rooms/create"
        className="inline-flex items-center h-10 px-5 bg-ink text-white text-[13px] font-semibold rounded-full hover:bg-ink-muted transition-colors"
      >
        새 모임 만들기
      </Link>
    </div>
  );
}

/* ── Main CalendarView ───────────────────────────────────────────────────── */

interface CalendarViewProps {
  schedules: ScheduleListItem[];
}

export function CalendarView({ schedules }: CalendarViewProps) {
  const [year,  setYear]  = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    const key = toDateKey(new Date());
    startTransition(() => {
      setTodayKey(key);
      setSelectedKey((prev) => prev ?? key);
    });
  }, []);

  /* Index schedules by date key */
  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleListItem[]>();
    for (const s of schedules) {
      const key = toDateKey(new Date(s.scheduledAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [schedules]);

  const cells = useMemo(() => getCalendarCells(year, month), [year, month]);

  // 캘린더 날짜 셀 렌더링 -> selectedSchedules이 있으면 해당 날짜에 점 표시
  const selectedSchedules = selectedKey ? (byDate.get(selectedKey) ?? []) : [];
  const monthHasSchedules = cells
    .filter((d) => d.getMonth() === month)
    .some((d) => byDate.has(toDateKey(d)));

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else             { setMonth((m) => m - 1); }
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else              { setMonth((m) => m + 1); }
  }

  const selectedDay = selectedKey ? parseInt(selectedKey.split("-")[2], 10) : null;

  return (
    <div
      className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden"
      style={{ animation: "section-fade 0.4s ease-out both" }}
    >
      {/* ── Left: Calendar grid panel ─────────────────────────────────── */}
      <div className="lg:w-100 xl:w-110 shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-hairline">

        {/* Page header */}
        <div className="px-6 lg:px-8 pt-8 pb-6 border-b border-hairline">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-px bg-hairline-strong" />
            <span className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase">
              내 일정
            </span>
          </div>
          <h1 className="text-[28px] lg:text-[34px] font-black text-ink tracking-tight leading-none">
            모임 일정
          </h1>
        </div>

        {/* Month navigator */}
        <div className="px-6 lg:px-8 py-5 flex items-center justify-between">
          <button
            onClick={prevMonth}
            aria-label="이전 달"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4.5 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-[11px] font-bold text-ink-tertiary tracking-[2px]">{year}</p>
            <p className="text-[22px] font-black text-ink tracking-tight leading-tight">
              {MONTH_LABELS[month]}
            </p>
          </div>

          <button
            onClick={nextMonth}
            aria-label="다음 달"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 2L9.5 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 px-4 lg:px-6 mb-1">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="h-8 flex items-center justify-center text-[11px] font-semibold text-ink-tertiary"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-4 lg:px-6 pb-6 gap-y-1 lg:flex-1">
          {cells.map((cellDate, i) => {
            const key         = toDateKey(cellDate);
            const isCurrMonth = cellDate.getMonth() === month;
            const isToday     = key === todayKey;
            const isSelected  = key === selectedKey;
            const hasSchedule = byDate.has(key) && isCurrMonth;

            return (
              <button
                key={i}
                onClick={() => isCurrMonth && setSelectedKey(key)}
                disabled={!isCurrMonth}
                aria-label={`${cellDate.getMonth() + 1}월 ${cellDate.getDate()}일`}
                aria-pressed={isSelected}
                className={[
                  "flex flex-col items-center justify-center aspect-square rounded-xl text-[13px] transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                  isSelected
                    ? "bg-accent text-white shadow-sm"
                    : isToday
                    ? "ring-1 ring-accent text-accent font-bold hover:bg-accent-light"
                    : isCurrMonth
                    ? "text-ink hover:bg-surface-3 cursor-pointer"
                    : "text-ink-tertiary cursor-default",
                ].join(" ")}
              >
                <span className={isToday && !isSelected ? "font-bold" : "font-medium"}>
                  {cellDate.getDate()}
                </span>
                {hasSchedule && (
                  <span
                    className={[
                      "w-1 h-1 rounded-full mt-0.5",
                      isSelected ? "bg-white/70" : "bg-accent",
                    ].join(" ")}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Schedule list panel ────────────────────────────────── */}
      <div className="lg:flex-1 lg:overflow-y-auto px-6 lg:px-10 py-8">
        {selectedKey && selectedDay ? (
          <div style={{ animation: "fade-up 0.25s ease-out both" }} key={selectedKey}>
            {/* Date heading */}
            <div className="mb-6">
              <p className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase mb-1">
                선택된 날짜
              </p>
              <p className="text-[22px] lg:text-[26px] font-black text-ink tracking-tight">
                {formatSelectedDate(year, month, selectedDay)}
              </p>
            </div>

            {selectedSchedules.length > 0 ? (
              <div className="space-y-3">
                {selectedSchedules.map((s, idx) => (
                  <ScheduleCard key={s.id} schedule={s} index={idx} />
                ))}
              </div>
            ) : (
              <DateEmptyState />
            )}
          </div>
        ) : monthHasSchedules ? (
          /* No date selected but month has schedules — show prompt */
          <div className="flex items-center justify-center h-full min-h-60">
            <p className="text-[14px] text-ink-subtle">날짜를 선택하면 일정을 볼 수 있어요</p>
          </div>
        ) : (
          <MonthEmptyState />
        )}
      </div>
    </div>
  );
}

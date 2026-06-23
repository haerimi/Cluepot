"use client";

import { useEffect, useMemo, useState, startTransition } from "react";
import Link from "next/link";
import type { ScheduleListItem } from "@/app/actions/schedule";
import { useUserStore } from "@/store/user";
import { InviteCodeWidget } from "./InviteCodeWidget";

/* ── 날짜 헬퍼 ── */

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
  const lastDay = new Date(year, month + 1, 0); // 섀도잉 방지: last → lastDay
  const cells: Date[] = [];

  // 1일이 속한 주의 일요일부터 채움
  for (let i = 0; i < first.getDay(); i++) {
    cells.push(new Date(year, month, 1 - (first.getDay() - i)));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  // 6주(42칸) 채우기
  while (cells.length < 42) {
    const lastCell = cells[cells.length - 1]; // 섀도잉 방지: last → lastCell
    cells.push(new Date(lastCell.getFullYear(), lastCell.getMonth(), lastCell.getDate() + 1));
  }
  return cells;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? "오전" : "오후";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const min = String(m).padStart(2, "0");
  return { date: datePart, time: `${period} ${hour}:${min}` };
}

/* ── 참석 상태 뱃지 ── */

function MyStatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-success-bg text-success-text border border-success/20 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
        수락
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-error-bg text-error border border-error-border shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" aria-hidden="true" />
        거절
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-ink-subtle border border-hairline shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-hairline-strong shrink-0" aria-hidden="true" />
      보류
    </span>
  );
}

/* ── 일정 정보 행 ── */

function InfoRow({
  icon,
  label,
  primary,
  secondary,
  prominent,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary?: string;
  prominent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 bg-surface rounded-2xl border border-hairline">
      <span className="shrink-0 text-accent mt-0.5" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-ink-tertiary tracking-[1.5px] uppercase mb-0.5">{label}</p>
        <p className={[
          "leading-snug",
          prominent
            ? "text-[17px] font-black text-ink tracking-tight"
            : "text-[14px] font-semibold text-ink",
        ].join(" ")}>
          {primary}
        </p>
        {secondary && (
          <p className="text-[12px] text-ink-subtle mt-0.5 leading-snug">{secondary}</p>
        )}
      </div>
    </div>
  );
}

/* ── 날짜에 일정이 여러 개일 때 탭 ── */

function ScheduleTabs({
  schedules,
  activeId,
  onSelect,
}: {
  schedules: ScheduleListItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (schedules.length <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label="같은 날 일정 목록"
      className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
    >
      {schedules.map((s) => {
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(s.id)}
            className={[
              "shrink-0 h-8 px-3.5 rounded-full text-[12px] font-semibold transition-all duration-150 border",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              "active:scale-95",
              isActive
                ? "bg-accent text-white border-accent"
                : "bg-surface text-ink-muted border-hairline hover:border-accent/50 hover:text-accent hover:-translate-y-0.5",
            ].join(" ")}
          >
            {s.title}
          </button>
        );
      })}
    </div>
  );
}

/* ── 오른쪽 패널: 선택된 일정 요약 카드 ── */

function ScheduleSummaryCard({ schedule }: { schedule: ScheduleListItem }) {
  const currentUserId = useUserStore((s) => s.userInfo?.myId);
  const isCreator = schedule.createdBy === currentUserId;
  const { date, time } = formatDateTime(schedule.scheduledAt);

  return (
    <div className="bg-surface border border-hairline rounded-2xl overflow-hidden">
      {/* 상단 액센트 바 */}
      <div className="h-[3px] bg-gradient-to-r from-accent/40 via-accent to-accent/40" aria-hidden="true" />

      <div className="p-5 lg:p-6">
        {/* 헤더 — 제목 + 참석 상태 */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-accent tracking-[2.5px] uppercase mb-1.5">
              현재 선택
            </span>
            <h3 className="text-[20px] font-black text-ink tracking-tight leading-tight">
              {schedule.title}
            </h3>
          </div>
          <MyStatusBadge status={schedule.myStatus} />
        </div>

        {/* 상세 정보 행들 */}
        <div className="space-y-2 mb-5">
          <InfoRow
            icon={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="일시"
            primary={time}
            secondary={date}
            prominent
          />
          <InfoRow
            icon={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.48-2.02-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            }
            label="장소"
            primary={schedule.placeName}
            secondary={schedule.placeAddress}
          />
          <InfoRow
            icon={
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1 13c0-2.2 2.24-4 5-4s5 1.8 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M11 9.5c1.66.33 3 1.5 3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            }
            label="참가자"
            primary={`${schedule.memberCount}명`}
          />
        </div>

        {/* 구분선 */}
        <div className="h-px bg-hairline mb-5" />

        {/* 액션 버튼 */}
        <div className="space-y-2.5">
          {isCreator && (
            <>
              {/* 1순위 CTA */}
              <Link
                href={`/calendar/${schedule.id}`}
                className="group w-full flex items-center justify-center gap-2 h-12 rounded-xl
                           bg-accent text-white text-[14px] font-semibold
                           shadow-[0_2px_8px_rgba(94,106,210,0.30)]
                           hover:bg-accent-hover hover:-translate-y-0.5
                           hover:shadow-[0_4px_14px_rgba(94,106,210,0.40)]
                           active:translate-y-0 active:scale-[0.99] active:shadow-sm
                           transition-all duration-150
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" className="shrink-0">
                  <rect x="1.5" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1.5 5.5h12" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 1v2.5M10 1v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                날짜·시간 변경
              </Link>

              {/* 2순위 */}
              <Link
                href={`/calendar/${schedule.id}`}
                className="group w-full flex items-center justify-center gap-2 h-11 rounded-xl
                           bg-surface border border-hairline text-ink text-[13px] font-semibold
                           hover:bg-surface-2 hover:border-hairline-strong hover:-translate-y-0.5
                           active:translate-y-0 active:scale-[0.99]
                           transition-all duration-150
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M7.5 1.5C4.74 1.5 2.5 3.74 2.5 6.5c0 4.16 5 7 5 7s5-2.84 5-7c0-2.76-2.24-5-5-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                장소 변경
              </Link>
            </>
          )}

          {/* 상세보기 — 비창작자에게는 primary CTA */}
          <Link
            href={`/calendar/${schedule.id}`}
            className={[
              "group w-full flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              isCreator
                ? "h-10 border border-hairline text-ink-muted hover:border-accent/40 hover:text-accent hover:bg-accent-light/50 active:scale-[0.99]"
                : "h-12 bg-accent text-white shadow-[0_2px_8px_rgba(94,106,210,0.30)] hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(94,106,210,0.40)] active:translate-y-0 active:scale-[0.99] active:shadow-sm",
            ].join(" ")}
          >
            모임 상세보기
            {/* 화살표 — hover 시 오른쪽으로 이동 */}
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              aria-hidden="true"
              className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
            >
              <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── 오른쪽 패널 공통 빈 상태 카드 ── */
/* EmptyDetailCard + MonthEmptyCard를 하나로 통합 */

function PanelEmptyCard({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-hairline rounded-2xl overflow-hidden">
      {/* 상단 회색 액센트 바 */}
      <div className="h-[3px] bg-gradient-to-r from-hairline via-hairline-strong to-hairline" aria-hidden="true" />
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div
          className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mb-4 text-accent
                     ring-4 ring-accent/10"
          style={{ animation: "float-slow 4s ease-in-out infinite" }}
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect x="3" y="5" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 11h20" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 3v4M17 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 16h4M14 16h4M8 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        {eyebrow && (
          <p className="text-[11px] font-bold text-accent tracking-[2px] uppercase mb-2">{eyebrow}</p>
        )}
        <p className="text-[15px] font-bold text-ink mb-1.5">{title}</p>
        <p className="text-[13px] text-ink-subtle leading-relaxed max-w-[180px]">
          {description}
        </p>
        {action && <div className="mt-7">{action}</div>}
      </div>
    </div>
  );
}

/* ── CalendarView ── */

interface CalendarViewProps {
  schedules: ScheduleListItem[];
}

export function CalendarView({ schedules }: CalendarViewProps) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [todayKey, setTodayKey] = useState<string | null>(null);
  /** 오른쪽 패널에 표시할 일정 ID */
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  /* SSR hydration mismatch 방지 — 클라이언트에서만 오늘 날짜 설정 */
  useEffect(() => {
    const key = toDateKey(new Date());
    startTransition(() => {
      setTodayKey(key);
      setSelectedKey((prev) => prev ?? key);
    });
  }, []);

  /* 날짜 → 일정 인덱스 */
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

  /* 선택된 날짜의 일정 목록 */
  const selectedSchedules = useMemo(
    () => (selectedKey ? (byDate.get(selectedKey) ?? []) : []),
    [selectedKey, byDate],
  );

  /* 현재 패널에 표시할 일정 객체 */
  const activeSchedule = useMemo(
    () => (activeScheduleId ? schedules.find((s) => s.id === activeScheduleId) ?? null : null),
    [activeScheduleId, schedules],
  );

  /* 이번 달에 일정이 있는지 — cells/byDate가 바뀔 때만 재계산 */
  const monthHasSchedules = useMemo(
    () =>
      cells
        .filter((d) => d.getMonth() === month)
        .some((d) => byDate.has(toDateKey(d))),
    [cells, byDate, month],
  );

  /* 날짜 클릭 — 일정 있으면 첫 번째를 패널에 */
  function handleSelectDate(key: string) {
    setSelectedKey(key);
    const list = byDate.get(key) ?? [];
    setActiveScheduleId(list.length > 0 ? list[0].id : null);
  }

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else { setMonth((m) => m - 1); }
    setSelectedKey(null);
    setActiveScheduleId(null);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else { setMonth((m) => m + 1); }
    setSelectedKey(null);
    setActiveScheduleId(null);
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ animation: "section-fade 0.35s ease-out both" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-10">

        {/* ── 페이지 헤더 ── */}
        <section className="mb-8 lg:mb-10" aria-label="페이지 제목">
          <div
            className="flex items-center gap-3 mb-2"
            style={{ animation: "fade-up 0.3s ease-out 0.05s both" }}
          >
            <div className="w-4 h-px bg-hairline-strong" aria-hidden="true" />
            <span className="text-[10px] font-bold text-ink-tertiary tracking-[3px] uppercase">
              내 일정
            </span>
          </div>
          <div
            className="flex items-end justify-between gap-4 flex-wrap"
            style={{ animation: "fade-up 0.35s ease-out 0.1s both" }}
          >
            <h1 className="text-[26px] lg:text-[32px] font-black text-ink tracking-tight leading-none">
              모임 일정
            </h1>
            {schedules.length > 0 && (
              <p className="text-[12px] text-ink-subtle flex items-center gap-1.5 pb-0.5" aria-live="polite">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="1" y="2" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1 5h12" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                총 {schedules.length}개의 일정
              </p>
            )}
          </div>
        </section>

        {/* ── 메인 그리드: 8/12 + 4/12 ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"
          style={{ animation: "fade-up 0.4s ease-out 0.15s both" }}
        >

          {/* ── 왼쪽: 캘린더 (8/12) ── */}
          <div className="lg:col-span-8 bg-surface border border-hairline rounded-2xl overflow-hidden">

            {/* 월 네비게이터 */}
            <div className="flex items-center justify-between px-5 lg:px-6 py-4 lg:py-5 border-b border-hairline">
              <h2 className="text-[18px] lg:text-[20px] font-black text-ink tracking-tight" aria-live="polite">
                {year}년 {MONTH_LABELS[month]}
              </h2>
              <div className="flex gap-1.5" role="group" aria-label="월 탐색">
                <button
                  onClick={prevMonth}
                  aria-label="이전 달"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-hairline text-ink-subtle
                             hover:text-ink hover:bg-surface-2 hover:border-hairline-strong
                             hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                             transition-all duration-150
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M9 2L4.5 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={nextMonth}
                  aria-label="다음 달"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-hairline text-ink-subtle
                             hover:text-ink hover:bg-surface-2 hover:border-hairline-strong
                             hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                             transition-all duration-150
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 2L9.5 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 px-3 lg:px-4 pt-4 pb-2">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={[
                    "h-7 flex items-center justify-center text-[11px] font-bold tracking-widest uppercase select-none",
                    i === 0 ? "text-error/60" : i === 6 ? "text-accent/80" : "text-ink-tertiary",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* 날짜 셀 */}
            <div className="grid grid-cols-7 gap-1 px-3 lg:px-4 pb-4 lg:pb-5">
              {cells.map((cellDate, i) => {
                const key = toDateKey(cellDate);
                const isCurrMonth = cellDate.getMonth() === month;
                const isToday = key === todayKey;
                const isSelected = key === selectedKey;
                const cellSchedules = isCurrMonth ? (byDate.get(key) ?? []) : [];
                const hasSchedule = cellSchedules.length > 0;

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectDate(key)} // disabled가 이미 클릭을 막으므로 isCurrMonth 조건 불필요
                    disabled={!isCurrMonth}
                    aria-label={`${cellDate.getMonth() + 1}월 ${cellDate.getDate()}일${isToday ? " (오늘)" : ""}${hasSchedule ? `, 일정 ${cellSchedules.length}개` : ""}`}
                    aria-pressed={isSelected && isCurrMonth}
                    className={[
                      /* 베이스 — flex로 날짜를 왼쪽 상단에 고정 */
                      "flex flex-col items-start justify-start",
                      "h-[60px] sm:h-20 lg:h-24 p-1.5 sm:p-2 rounded-xl border overflow-hidden",
                      "transition-all duration-100",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                      /* 상태별 */
                      isSelected
                        ? "bg-accent/[0.12] border-accent ring-2 ring-accent/60 ring-offset-1 ring-offset-canvas"
                        : hasSchedule
                          ? "bg-accent/[0.07] border-accent/30 hover:bg-accent/[0.12] hover:border-accent/50 cursor-pointer active:scale-[0.97]"
                          : isCurrMonth
                            ? "border-hairline hover:bg-surface-2 hover:border-hairline-strong cursor-pointer active:scale-[0.97]"
                            : "border-transparent cursor-default",
                    ].join(" ")}
                  >
                    {/* 날짜 숫자 — isSelected/isToday 조건 통합 */}
                    <span
                      className={[
                        "leading-none font-semibold text-[11px] sm:text-[13px]",
                        (isSelected || isToday)
                          ? "text-accent font-black"
                          : hasSchedule
                            ? "text-accent font-bold"
                            : isCurrMonth
                              ? "text-ink"
                              : "text-ink-tertiary opacity-40",
                      ].join(" ")}
                    >
                      {cellDate.getDate()}
                    </span>

                    {/* 오늘 표시 — 날짜 숫자 아래 작은 점 */}
                    {isToday && !isSelected && (
                      <span
                        className="block w-1 h-1 rounded-full bg-accent mt-0.5"
                        aria-hidden="true"
                      />
                    )}

                    {/* 이벤트 뱃지 — w-full로 셀 너비 전체 사용 */}
                    {hasSchedule && (
                      <div className="mt-1 w-full space-y-0.5 overflow-hidden min-w-0">
                        {cellSchedules.slice(0, 2).map((s) => (
                          <div
                            key={s.id}
                            className={[
                              "w-full text-[8px] sm:text-[10px] text-left px-1 py-px rounded font-semibold truncate leading-tight",
                              isSelected ? "bg-accent text-white" : "bg-accent text-white/95",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            {s.title}
                          </div>
                        ))}
                        {cellSchedules.length > 2 && (
                          <div className="text-[8px] sm:text-[9px] text-accent font-bold pl-px" aria-hidden="true">
                            +{cellSchedules.length - 2}개
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* ── 오른쪽: 상세 패널 (4/12) ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* 선택된 일정이 여러 개일 때 탭 */}
            {selectedSchedules.length > 1 && activeScheduleId && (
              <ScheduleTabs
                schedules={selectedSchedules}
                activeId={activeScheduleId}
                onSelect={setActiveScheduleId}
              />
            )}

            {/* 일정 요약 카드 / 빈 상태 */}
            <div
              key={activeScheduleId ?? (monthHasSchedules ? "empty-date" : "empty-month")}
              style={{ animation: "fade-up 0.22s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              {activeSchedule ? (
                <ScheduleSummaryCard schedule={activeSchedule} />
              ) : monthHasSchedules ? (
                /* 이달 일정은 있지만 날짜를 아직 선택하지 않은 상태 */
                <PanelEmptyCard
                  title="날짜를 선택해주세요"
                  description="캘린더에서 날짜를 클릭하면 일정 상세를 여기서 볼 수 있어요"
                />
              ) : (
                /* 이달 일정이 아예 없는 상태 */
                <PanelEmptyCard
                  eyebrow={MONTH_LABELS[month]}
                  title="이달의 일정이 없어요"
                  description="모임을 만들고 피니로 장소를 확정하면 여기에 기록돼요"
                  action={
                    <Link
                      href="/rooms/create"
                      className="inline-flex items-center h-11 px-6 bg-accent text-white text-[13px] font-semibold rounded-full
                                 hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0
                                 transition-all duration-150
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      새 모임 만들기
                    </Link>
                  }
                />
              )}
            </div>

            {/* 초대 코드 위젯 */}
            <InviteCodeWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

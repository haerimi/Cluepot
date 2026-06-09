"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { getRecommendedDates } from "@/app/actions/participant";

export interface ScheduleDateModalProps {
  placeName: string;
  placeAddress: string;
  roomCode: string;
  onSubmit: (data: {
    title: string;
    scheduledAt: string;
    memo: string;
  }) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

function initTime(): { ampm: "오전" | "오후"; hour: string; minute: string } {
  const now = new Date();
  let h = now.getHours();
  let m = Math.round(now.getMinutes() / 5) * 5;
  if (m === 60) { m = 0; h = (h + 1) % 24; }
  const ampm: "오전" | "오후" = h < 12 ? "오전" : "오후";
  const h12 = h % 12;
  return {
    ampm,
    hour: String(h12 === 0 ? 12 : h12),
    minute: String(m).padStart(2, "0"),
  };
}

type Recommendation = {
  date: string;
  count: number;
  total: number;
}

export function ScheduleDateModal({
  placeName,
  onSubmit,
  onCancel,
  roomCode,
  isSubmitting = false,
  submitError = null,
}: Readonly<ScheduleDateModalProps>) {
  const today = new Date().toISOString().slice(0, 10);
  const init = initTime();

  const [title, setTitle] = useState(placeName);
  const [date, setDate] = useState(today);
  const [ampm, setAmpm] = useState<"오전" | "오후">(init.ampm);
  const [hour, setHour] = useState(init.hour);
  const [minute, setMinute] = useState(init.minute);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    getRecommendedDates(roomCode).then(setRecommendations).catch(() => {})
  }, [roomCode])

  // Esc 키로 모달 닫기 (제출 중에는 닫기 방지)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onCancel]);

  function getTime24() {
    let h = Number.parseInt(hour, 10);
    if (ampm === "오전" && h === 12) h = 0;
    else if (ampm === "오후" && h !== 12) h += 12;
    return `${String(h).padStart(2, "0")}:${minute}`;
  }

  function handleSubmit() {
    if (!date) { setError("날짜를 선택해주세요"); return; }
    if (!title.trim()) { setError("일정 제목을 입력해주세요"); return; }
    setError(null);
    onSubmit({ title: title.trim(), scheduledAt: `${date}T${getTime24()}:00+09:00`, memo });
  }

  const selectClass =
    "h-11 px-2 rounded-xl border border-hairline bg-canvas text-[14px] text-ink text-center " +
    "outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      {/* backdrop — button으로 교체해 키보드 접근성 확보 */}
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] w-full h-full cursor-default"
        onClick={isSubmitting ? undefined : onCancel}
      />

      <dialog
        open
        aria-labelledby="schedule-date-modal-title"
        className="relative w-full sm:max-w-[440px] bg-white rounded-t-[24px] sm:rounded-2xl shadow-xl px-6 pt-6 pb-8 sm:pb-7 m-0 p-0"
        style={{ animation: "cinematic-up 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="sm:hidden w-10 h-1 bg-hairline rounded-full mx-auto mb-5" />

        <div className="mb-6">
          <p className="text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-2">
            일정 확정
          </p>
          <h2 id="schedule-date-modal-title" className="text-[22px] font-black text-ink tracking-tight leading-tight">
            언제 만날까요?
          </h2>
          <p className="text-[13px] text-ink-subtle mt-1">{placeName}</p>
        </div>

        <div className="space-y-5">
          {/* 추천 날짜 */}
          {recommendations.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
                추천 날짜
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendations.slice(0, 5).map((r) => {
                  const allAvailable = r.count === r.total
                  return (
                    <button
                      key={r.date}
                      type="button"
                      onClick={() => setDate(r.date)}
                      className={[
                        "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors",
                        date === r.date
                          ? "bg-accent text-white border-accent"
                          : allAvailable
                            ? "bg-success-bg text-success-text border-success/20 hover:bg-success/10"
                            : "bg-surface text-ink-muted border-hairline hover:bg-surface-warm",
                      ].join(" ")}
                    >
                      {r.date.slice(5).replace("-", "/")}
                      <span className="ml-1.5 opacity-70">{r.count}/{r.total}명</span>
                    </button>
                  )
                })}
              </div>
              {recommendations.every(r => r.count < r.total) && (
                <p className="text-[11px] text-ink-subtle mt-2">모두 가능한 날짜가 없어요. 직접 선택해주세요.</p>
              )}
            </div>
          )}

          {/* 일정 이름 */}
          <div>
            <label
              htmlFor="schedule-title"
              className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2"
            >
              일정 이름
            </label>
            <input
              id="schedule-title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(null); }}
              className="w-full h-11 px-4 rounded-xl border border-hairline bg-canvas text-[16px] text-ink
                         outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
            />
          </div>

          {/* 날짜 + 시간 행 */}
          <div className="flex gap-3">
            {/* 날짜 */}
            <div className="flex-1">
              <label
                htmlFor="schedule-date"
                className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2"
              >
                날짜
              </label>
              <input
                id="schedule-date"
                type="date"
                value={date}
                min={today}
                onChange={(e) => { setDate(e.target.value); setError(null); }}
                className="w-full h-11 px-3 rounded-xl border border-hairline bg-canvas text-[16px] text-ink
                           outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
              />
            </div>

            {/* 시간 — 관련 select 3개를 fieldset으로 묶어 레이블 연결 */}
            <fieldset className="flex-1 border-0 p-0 m-0">
              <legend className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
                시간
              </legend>
              <div className="flex items-center gap-1.5">
                <label htmlFor="schedule-ampm" className="sr-only">오전/오후</label>
                <select
                  id="schedule-ampm"
                  value={ampm}
                  onChange={(e) => setAmpm(e.target.value as "오전" | "오후")}
                  className={selectClass}
                >
                  <option value="오전">오전</option>
                  <option value="오후">오후</option>
                </select>

                <label htmlFor="schedule-hour" className="sr-only">시</label>
                <select
                  id="schedule-hour"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className={selectClass}
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                <span className="text-ink-tertiary font-bold text-[14px]" aria-hidden="true">:</span>

                <label htmlFor="schedule-minute" className="sr-only">분</label>
                <select
                  id="schedule-minute"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className={selectClass}
                >
                  {Array.from({ length: 12 }, (_, i) =>
                    String(i * 5).padStart(2, "0")
                  ).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </fieldset>
          </div>

          {/* 메모 */}
          <div>
            <label
              htmlFor="schedule-memo"
              className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2"
            >
              메모{" "}
              <span className="text-ink-tertiary font-normal normal-case tracking-normal">(선택)</span>
            </label>
            <textarea
              id="schedule-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              placeholder="모임에 대한 메모를 남겨요"
              className="w-full px-4 py-3 rounded-xl border border-hairline bg-canvas text-[14px] text-ink
                         placeholder:text-ink-tertiary resize-none text-[16px]
                         outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
            />
          </div>

          {error && (
            <p className="text-[12px] text-error flex items-center gap-1.5" role="alert">
              <span aria-hidden="true">⚠️</span>{error}
            </p>
          )}
          {submitError && (
            <p className="text-[12px] text-error flex items-center gap-1.5" role="alert">
              <span aria-hidden="true">⚠️</span>{submitError}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "저장하는 중…" : "일정 확정하기"}
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
        </div>
      </dialog>
    </div>
  );
}

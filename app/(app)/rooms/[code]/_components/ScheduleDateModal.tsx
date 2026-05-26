"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";

export interface ScheduleDateModalProps {
  placeName: string;
  placeAddress: string;
  onSubmit: (data: {
    title: string;
    scheduledAt: string;
    memo: string;
  }) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ScheduleDateModal({
  placeName,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ScheduleDateModalProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState(placeName);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("18:00");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!date) { setError("날짜를 선택해주세요"); return; }
    if (!time) { setError("시간을 선택해주세요"); return; }
    if (!title.trim()) { setError("일정 제목을 입력해주세요"); return; }
    setError(null);
    onSubmit({ title: title.trim(), scheduledAt: `${date}T${time}`, memo });
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ animation: "section-fade 0.2s ease-out both" }}
    >
      {/* Dim */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      {/* Sheet / Card */}
      <div
        className="relative w-full sm:max-w-[440px] bg-white rounded-t-[24px] sm:rounded-2xl shadow-xl px-6 pt-6 pb-8 sm:pb-7"
        style={{ animation: "cinematic-up 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden w-10 h-1 bg-hairline rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-2">
            일정 확정
          </p>
          <h2 className="text-[22px] font-black text-ink tracking-tight leading-tight">
            언제 만날까요?
          </h2>
          <p className="text-[13px] text-ink-subtle mt-1">{placeName}</p>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
              일정 이름
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(null); }}
              className="w-full h-11 px-4 rounded-xl border border-hairline bg-canvas text-[14px] text-ink
                         outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
            />
          </div>

          {/* Date + Time row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
                날짜
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => { setDate(e.target.value); setError(null); }}
                className="w-full h-11 px-3 rounded-xl border border-hairline bg-canvas text-[14px] text-ink
                           outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
              />
            </div>
            <div className="w-[130px]">
              <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
                시간
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => { setTime(e.target.value); setError(null); }}
                className="w-full h-11 px-3 rounded-xl border border-hairline bg-canvas text-[14px] text-ink
                           outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
              />
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-[11px] font-bold text-ink-subtle tracking-[2px] uppercase mb-2">
              메모 <span className="text-ink-tertiary font-normal normal-case tracking-normal">(선택)</span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              placeholder="모임에 대한 메모를 남겨요"
              className="w-full px-4 py-3 rounded-xl border border-hairline bg-canvas text-[14px] text-ink
                         placeholder:text-ink-tertiary resize-none
                         outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white"
            />
          </div>

          {error && (
            <p className="text-[12px] text-[#DC2626] flex items-center gap-1.5">
              <span>⚠️</span>{error}
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
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateRoom } from "@/app/actions/rooms";

export function InviteCodeWidget() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("코드를 입력해주세요.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await validateRoom(trimmed);
      if (!result.valid) {
        setError(result.reason ?? "유효하지 않은 코드예요.");
        return;
      }
      router.push(`/rooms/${trimmed}`);
    } catch {
      setError("확인 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  const inputId = "invite-code-input";

  return (
    <div
      className="rounded-2xl border border-hairline bg-white shadow-sm overflow-hidden"
      style={{ animation: "fade-up 0.4s ease-out 0.2s both" }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-hairline">
        <div
          className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 4.5H11.5" stroke="#7298C7" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M1.5 8.5H11.5" stroke="#7298C7" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M4.5 2L3.5 11" stroke="#7298C7" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M9.5 2L8.5 11" stroke="#7298C7" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-bold text-ink leading-tight">코드로 모임 참가</p>
          <p className="text-[11px] text-ink-subtle leading-tight mt-0.5">초대받은 코드를 입력하세요</p>
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="px-5 py-4">
        {/* visible label — 스크린 리더용이자 시각적 레이블 */}
        <label
          htmlFor={inputId}
          className="block text-[10px] font-bold text-ink-tertiary tracking-[2px] uppercase mb-2"
        >
          초대 코드
        </label>

        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="예: AB12CD"
            maxLength={8}
            autoComplete="off"
            spellCheck={false}
            className={[
              "flex-1 h-11 px-3.5 rounded-xl border text-[14px] font-mono tracking-[0.2em] text-ink uppercase",
              "bg-surface outline-none transition-all duration-150",
              "placeholder:text-ink-subtle/60 placeholder:font-sans placeholder:tracking-normal placeholder:text-[13px]",
              error
                ? "border-error-border focus:ring-2 focus:ring-error/20 focus:border-error bg-error-bg/30"
                : "border-hairline focus:ring-2 focus:ring-accent/25 focus:border-accent focus:bg-white focus:shadow-[0_0_0_4px_rgba(114,152,199,0.08)]",
            ].join(" ")}
          />
          <button
            onClick={handleJoin}
            disabled={isLoading || !code.trim()}
            aria-label={isLoading ? "참가 중…" : "모임 참가하기"}
            className="h-11 px-5 rounded-xl bg-accent text-white text-[13px] font-semibold shrink-0
                       shadow-[0_1px_4px_rgba(114,152,199,0.25)]
                       hover:bg-accent-hover hover:-translate-y-0.5
                       hover:shadow-[0_3px_10px_rgba(114,152,199,0.35)]
                       active:translate-y-0 active:scale-95 active:shadow-sm
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0
                       transition-all duration-150
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <span
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
            ) : (
              "참가"
            )}
          </button>
        </div>

        {/* 오류 피드백 */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2 mt-3 px-3.5 py-3 rounded-xl bg-error-bg border border-error-border"
            style={{ animation: "fade-up 0.18s ease-out both" }}
          >
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              aria-hidden="true"
              className="shrink-0 mt-0.5"
            >
              <circle cx="7" cy="7" r="6" stroke="#DC2626" strokeWidth="1.4" />
              <path d="M7 4v3.5" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="7" cy="10" r="0.7" fill="#DC2626" />
            </svg>
            <p className="text-[12px] font-medium text-error leading-snug">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

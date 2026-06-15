"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/util/supabase/client";
import { validateRoom } from "@/app/actions/rooms";
import { joinRoom } from "@/app/actions/participant"

// ── 아이콘 ──────────────────────────────────────────────────

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGroup() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 13c2.5 0 4.5 1.2 4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 6v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="6.5" cy="3.8" r="0.7" fill="currentColor" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── JoinRoomPage ──────────────────────────────────────────────

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
    });
    // 자동 포커스
    inputRef.current?.focus();
  }, [router]);

  const normalizedCode = code.trim().toUpperCase();
  const isValid = normalizedCode.length >= 4;

  async function handleJoin() {
    if (!isValid || isJoining) return;
    setError(null);
    setIsJoining(true);
    const validate = await validateRoom(normalizedCode)

    if (!validate.valid) {
      setError(validate.reason ?? "유효하지 않은 코드예요.");
      setIsJoining(false);
      return;
    }

    await joinRoom(normalizedCode)
    router.push(`/rooms/${normalizedCode}`);
  }

  return (
    <div className="min-h-dvh bg-canvas flex flex-col overflow-x-hidden">

      {/* ── 배경 ambient glow ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(114,152,199,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── 헤더 — create 페이지와 동일한 구조 ── */}
      <header
        className="fixed top-0 w-full z-50"
        style={{
          background: "rgba(244,245,240,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid #E2E6EC",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* 좌측: 뒤로가기 + 브랜드 로고 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-hairline text-ink-subtle hover:border-hairline-strong hover:text-ink-muted transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="뒤로 가기"
            >
              <IconBack />
            </button>

            <Link
              href="/"
              aria-label="CluePot 홈으로"
              className="flex items-center gap-2 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
            >
              <div className="w-8 h-8 rounded bg-accent flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
                </svg>
              </div>
              <span className="text-[20px] sm:text-[22px] font-bold tracking-tight text-ink">
                CluePot
              </span>
            </Link>
          </div>

          {/* 우측: 모임 만들기 */}
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="모임 생성 네비게이션">
            <span className="hidden sm:block text-[13px] font-medium text-ink-subtle">
              모임이 없으신가요?
            </span>
            <Link
              href="/rooms/create"
              className="h-9 px-4 text-[13px] font-medium rounded-lg border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong hover:bg-surface flex items-center gap-1.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <IconPlus />
              모임 만들기
            </Link>
          </nav>

        </div>
      </header>

      {/* ── Main ── */}
      <main
        className="flex-1 flex items-center justify-center px-4 py-8 pt-[88px] pb-[72px] z-10 relative"
        style={{ animation: "cinematic-up 0.5s ease-out both" }}
      >
        <div className="w-full max-w-[440px]">

          {/* ── 카드 ── */}
          <div className="bg-white rounded-2xl border border-hairline shadow-[0_8px_32px_rgba(26,32,51,0.06)] overflow-hidden">

            {/* 상단 accent 라인 */}
            <div
              className="h-px w-full"
              aria-hidden="true"
              style={{ background: "linear-gradient(90deg, transparent, rgba(114,152,199,0.5), transparent)" }}
            />

            <div className="p-8 sm:p-10">

              {/* 아이콘 + 헤드라인 */}
              <div className="flex flex-col items-center text-center mb-8" style={{ animation: "fade-up 0.4s ease-out 0.05s both" }}>
                <div className="w-12 h-12 rounded-full bg-accent-light border border-accent/20 flex items-center justify-center mb-4 text-accent">
                  <IconGroup />
                </div>
                <h1 className="text-[26px] font-black text-ink leading-tight tracking-[-0.6px] mb-2">
                  모임에 참가하기
                </h1>
                <p className="text-[14px] text-ink-subtle leading-relaxed">
                  호스트에게 받은 모임 코드를 입력해주세요
                </p>
              </div>

              {/* ── 코드 입력 폼 ── */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleJoin(); }}
                className="space-y-5"
                noValidate
              >
                {/* 라벨 행 */}
                <div>
                  <div className="flex items-end justify-between mb-2.5">
                    <label
                      htmlFor="room-code"
                      className="text-[11px] font-bold text-ink-muted tracking-[1.5px] uppercase"
                    >
                      초대 코드
                    </label>
                    <span className="text-[10px] text-ink-subtle font-mono tracking-wide">
                      최대 8자리
                    </span>
                  </div>

                  {/* 인풋 래퍼 — focus-within glow */}
                  <div
                    className={[
                      "relative rounded-xl transition-all duration-200",
                      error ? "" : "focus-within:[box-shadow:0_0_0_3px_rgba(114,152,199,0.15),0_0_18px_rgba(114,152,199,0.12)]",
                    ].join(" ")}
                  >
                    <input
                      ref={inputRef}
                      id="room-code"
                      type="text"
                      value={code}
                      onChange={(e) => {
                        // 영숫자만 허용, 대문자 변환
                        const filtered = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                        setCode(filtered);
                        setError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                      placeholder="예: ABC123"
                      maxLength={8}
                      autoCapitalize="characters"
                      autoComplete="off"
                      spellCheck={false}
                      aria-required="true"
                      aria-describedby={error ? "code-error" : "code-hint"}
                      aria-invalid={!!error}
                      className={[
                        "w-full h-14 px-4 rounded-xl border text-[24px] font-black tracking-[6px] text-center",
                        "placeholder:text-hairline-strong placeholder:text-[16px] placeholder:tracking-normal placeholder:font-medium",
                        "outline-none transition-all duration-150",
                        error
                          ? "border-error bg-error-bg text-error focus:ring-2 focus:ring-error/30 focus:ring-offset-0"
                          : "border-hairline bg-canvas text-ink focus:border-accent",
                      ].join(" ")}
                    />
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div
                      id="code-error"
                      className="flex items-start gap-2 mt-2.5"
                      role="alert"
                      aria-live="assertive"
                      style={{ animation: "fade-up 0.25s ease-out both" }}
                    >
                      <span className="text-error text-[13px] shrink-0" aria-hidden="true">⚠️</span>
                      <p className="text-[13px] text-error leading-snug">{error}</p>
                    </div>
                  )}

                  {/* 힌트 — 에러 없을 때만 표시 */}
                  {!error && (
                    <p id="code-hint" className="flex items-center justify-center gap-1.5 mt-2.5 text-[12px] text-ink-subtle">
                      <IconInfo />
                      코드는 대소문자 구분 없이 입력할 수 있어요
                    </p>
                  )}
                </div>

                {/* ── CTA 버튼 ── */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={!isValid || isJoining}
                    aria-label="모임 입장하기"
                    className={[
                      "w-full h-[52px] rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2",
                      "transition-all duration-150 active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      isValid && !isJoining ? "group" : "",
                    ].join(" ")}
                    style={{
                      backgroundColor: "#7298C7",
                      color: "#fff",
                      boxShadow: isValid && !isJoining ? "0 2px 8px rgba(114,152,199,0.35)" : undefined,
                      animation: isValid && !isJoining ? "cta-glow 2.8s ease-in-out infinite" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (isValid && !isJoining)
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#5C7FB5";
                    }}
                    onMouseLeave={(e) => {
                      if (isValid && !isJoining)
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7298C7";
                    }}
                  >
                    {isJoining ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        <span>입장하는 중…</span>
                      </>
                    ) : (
                      <>
                        <span>모임 입장하기</span>
                        <span className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">
                          <IconArrow />
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* ── 하단 구분선 + 모임 생성 링크 ── */}
              <div className="mt-8 pt-6 border-t border-hairline text-center">
                <Link
                  href="/rooms/create"
                  className="inline-flex items-center gap-1.5 text-[13px] text-ink-subtle hover:text-accent transition-colors duration-150 group"
                >
                  <IconPlus />
                  <span className="group-hover:underline underline-offset-2">
                    직접 모임 만들기
                  </span>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── 푸터 ── */}
      <footer className="w-full z-10 py-7 px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 max-w-[1200px] mx-auto">
        <span className="text-[12px] text-ink-subtle">
          © 2026 CluePot. All rights reserved.
        </span>
        <div className="flex gap-5">
          <a href="#" className="text-[12px] text-ink-subtle hover:text-ink-muted hover:underline underline-offset-2 transition-colors duration-150">
            개인정보처리방침
          </a>
          <a href="#" className="text-[12px] text-ink-subtle hover:text-ink-muted hover:underline underline-offset-2 transition-colors duration-150">
            이용약관
          </a>
        </div>
      </footer>

    </div>
  );
}

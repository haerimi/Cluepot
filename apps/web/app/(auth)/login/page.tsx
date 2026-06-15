"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";

/* ── 아이콘 SVG (색상은 부모에서 currentColor로 상속) ─────────────────── */

function IconMail() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconArrow() {
  return (
    /* group-hover:translate-x-0.5 — 버튼 hover 시 화살표가 살짝 이동 */
    <svg
      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

/* ── 인풋 래퍼 ─────────────────────────────────────────────────────────── */

interface AuthInputProps {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly placeholder: string;
  readonly autoComplete?: string;
  readonly required?: boolean;
  readonly icon: React.ReactNode;
}

function AuthInput({ id, name, type, placeholder, autoComplete, required, icon }: AuthInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={[
        "flex items-center gap-3 px-4 rounded-xl border transition-all duration-200",
        focused
          ? "bg-[#141516] border-[#5e6ad2]"
          : "bg-[#0f1011] border-[#23252a] hover:border-[#34343a] hover:bg-[#141516]",
      ].join(" ")}
      /* 포커스 시 라벤더 글로우 링 */
      style={focused ? { boxShadow: "0 0 0 3px rgba(94,106,210,0.12)" } : undefined}
    >
      {/* 아이콘: 포커스 시 accent 색상으로 전환 */}
      <span
        className="shrink-0 transition-colors duration-200"
        style={{ color: focused ? "#bdc2ff" : "#454652" }}
      >
        {icon}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        /* py-[14px]: 상하 패딩 포함 최소 tap target 48px 확보 */
        className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#f7f8f8] placeholder:text-[#3e3e44] min-w-0 py-[14px]"
      />
    </div>
  );
}

/* ── 비밀번호 인풋 (표시/숨김 토글 포함) ─────────────────────────────── */

function PasswordInput() {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={[
        "flex items-center gap-3 px-4 rounded-xl border transition-all duration-200",
        focused
          ? "bg-[#141516] border-[#5e6ad2]"
          : "bg-[#0f1011] border-[#23252a] hover:border-[#34343a] hover:bg-[#141516]",
      ].join(" ")}
      style={focused ? { boxShadow: "0 0 0 3px rgba(94,106,210,0.12)" } : undefined}
    >
      <span
        className="shrink-0 transition-colors duration-200"
        style={{ color: focused ? "#bdc2ff" : "#454652" }}
      >
        <IconLock />
      </span>
      <input
        id="password"
        name="password"
        type={show ? "text" : "password"}
        placeholder="••••••••"
        autoComplete="current-password"
        required
        aria-required="true"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#f7f8f8] placeholder:text-[#3e3e44] min-w-0 py-[14px]"
      />
      {/* 비밀번호 표시/숨김 — w-10 h-10으로 44px tap target 확보 */}
      <button
        type="button"
        aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
        onClick={() => setShow((p) => !p)}
        className="shrink-0 -mr-1 w-10 h-10 flex items-center justify-center rounded-lg text-[#454652] hover:text-[#c6c5d5] hover:bg-white/5 active:scale-90 transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2]"
      >
        <IconEye open={show} />
      </button>
    </div>
  );
}

/* ── 페이지 ─────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, { error: null });

  return (
    /* 전체 화면: 상단 accent glow가 있는 딥 다크 캔버스 */
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse 90% 45% at 50% 0%, rgba(94,106,210,0.08) 0%, #010102 55%)",
        color: "#f7f8f8",
      }}
    >

      {/* ── 상단 네비게이션 — HomeNav 스타일 기준 ─────────────────────────── */}
      <header
        className="fixed top-0 w-full z-50"
        style={{
          background: "rgba(1,1,2,0.85)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid #23252a",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* 브랜드 로고 — HomeNav와 동일 */}
          <Link
            href="/"
            aria-label="CluePot 홈으로"
            className="flex items-center gap-2 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010102] rounded"
          >
            <div
              className="w-8 h-8 rounded flex items-center justify-center shrink-0"
              style={{ background: "#5e6ad2" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              </svg>
            </div>
            <span className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[#bdc2ff]">
              CluePot
            </span>
          </Link>

          {/* 우측: 회원가입 — HomeNav 비로그인 상태 버튼 스타일 기준 */}
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="인증 네비게이션">
            <span className="hidden sm:block text-[13px] font-medium text-[#8a8f98]">
              계정이 없으신가요?
            </span>
            <Link
              href="/signup"
              className="h-9 px-4 text-[13px] font-semibold rounded-lg border border-[#34343a] text-[#d0d6e0] hover:text-white hover:border-[#454652] hover:bg-[#1a1a1e] flex items-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]"
            >
              회원가입
            </Link>
          </nav>

        </div>
      </header>

      {/* ── 메인: 카드 중앙 배치 ──────────────────────────────────────────── */}
      <main
        className="flex-1 flex items-center justify-center px-4 sm:px-6"
        /* pt: 헤더(56px) + 여백(32px) = 88px */
        style={{ paddingTop: "88px", paddingBottom: "72px" }}
      >

        {/* 카드 컨테이너 */}
        <div
          className="w-full max-w-[440px] relative"
          style={{ animation: "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both" }}
        >

          {/* 카드 하단 빛 번짐 */}
          <div
            className="absolute -inset-6 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(94,106,210,0.07) 0%, transparent 65%)",
            }}
          />

          {/* 카드 본체 */}
          <div
            className="relative bg-[#0f1011] border border-[#23252a] rounded-2xl overflow-hidden"
            style={{
              boxShadow:
                "0 32px 72px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset",
            }}
          >
            {/* 앰비언트 글로우 오버레이 */}
            <div className="glass-glow" />

            {/* 카드 상단 accent 라인 — 계층 구조 강조 */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#5e6ad2]/40 to-transparent" />

            {/* 카드 콘텐츠 */}
            <div className="relative z-10 px-7 py-8 sm:px-10 sm:py-10">

              {/* 카드 헤더 */}
              <div className="mb-8 text-center">
                {/* eyebrow 배지 */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
                  <span className="text-[11px] font-bold text-[#bdc2ff] tracking-[1.5px] uppercase">
                    로그인
                  </span>
                </div>
                <h1 className="text-[28px] sm:text-[30px] font-black text-[#e5e1e6] tracking-tight leading-tight mb-2.5">
                  다시 오셨군요
                </h1>
                <p className="text-[14px] text-[#8a8f98] leading-relaxed">
                  계정에 로그인해 모임을 이어가세요.
                </p>
              </div>

              {/* 로그인 폼 */}
              <form action={action} aria-label="로그인 폼">
                <div className="flex flex-col gap-4">

                  {/* 이메일 */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-1"
                      style={{ color: "#908f9e" }}
                    >
                      이메일
                      {/* required 시각 표시 */}
                      <span aria-hidden="true" className="text-[#5e6ad2]">*</span>
                    </label>
                    <AuthInput
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      icon={<IconMail />}
                    />
                  </div>

                  {/* 비밀번호 */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="password"
                      className="text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-1"
                      style={{ color: "#908f9e" }}
                    >
                      비밀번호
                      <span aria-hidden="true" className="text-[#5e6ad2]">*</span>
                    </label>
                    <PasswordInput />
                  </div>

                  {/* 로그인 유지 — label 전체가 클릭 영역 (min-h 44px tap target) */}
                  <label
                    htmlFor="rememberMe"
                    className="flex items-center gap-3 cursor-pointer group min-h-[44px]"
                  >
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      className="w-4 h-4 rounded border-[#454652] bg-[#0f1011] accent-[#5e6ad2] cursor-pointer"
                    />
                    <span className="text-[13px] text-[#8a8f98] select-none group-hover:text-[#c6c5d5] transition-colors duration-150">
                      로그인 유지
                    </span>
                  </label>

                </div>

                {/* 에러 메시지 — aria-live로 스크린리더 즉시 읽기 */}
                <div aria-live="assertive" aria-atomic="true">
                  {state?.error && (
                    <div
                      className="flex items-start gap-2.5 mt-4 text-[13px] text-[#ffb4ab] bg-[#93000a]/20 border border-[#93000a]/40 rounded-xl px-4 py-3"
                      role="alert"
                      style={{ animation: "fade-up 0.2s ease-out both" }}
                    >
                      <IconWarning />
                      <span>{state.error}</span>
                    </div>
                  )}
                </div>

                {/* 로그인 버튼 */}
                <button
                  type="submit"
                  disabled={pending}
                  className={[
                    /* group — IconArrow의 group-hover:translate-x-0.5와 연동 */
                    "group mt-5 h-[52px] w-full rounded-xl",
                    "bg-[#5e6ad2] text-white text-[15px] font-bold",
                    "flex items-center justify-center gap-2.5",
                    "transition-all duration-200 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010102]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                    /* 대기 중이 아닐 때만 glow pulse 적용 */
                    !pending ? "hover:bg-[#6b78dc] btn-cta-pulse" : "",
                  ].join(" ")}
                >
                  {pending ? (
                    <>
                      <span
                        className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"
                        aria-hidden="true"
                      />
                      <span>로그인 중…</span>
                    </>
                  ) : (
                    <>
                      <span>로그인하기</span>
                      <IconArrow />
                    </>
                  )}
                </button>

              </form>

              {/* 구분선 */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#1e1e22]" />
                <span className="text-[11px] font-bold text-[#454652] tracking-[2px] uppercase">
                  또는
                </span>
                <div className="flex-1 h-px bg-[#1e1e22]" />
              </div>

              {/* 소셜 로그인 — 추후 연동 예정 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled
                  title="준비 중"
                  aria-disabled="true"
                  className="flex items-center justify-center gap-2.5 h-11 bg-[#141516] border border-[#23252a] rounded-xl text-[14px] font-medium cursor-not-allowed"
                  style={{ color: "rgba(247,248,248,0.25)" }}
                >
                  <IconGoogle />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  disabled
                  title="준비 중"
                  aria-disabled="true"
                  className="flex items-center justify-center gap-2.5 h-11 bg-[#141516] border border-[#23252a] rounded-xl text-[14px] font-medium cursor-not-allowed"
                  style={{ color: "rgba(247,248,248,0.25)" }}
                >
                  <IconGithub />
                  <span>GitHub</span>
                </button>
              </div>

              {/* 회원가입 링크 */}
              <p className="mt-7 text-center text-[14px] text-[#8a8f98]">
                처음이세요?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#bdc2ff] hover:text-white hover:underline underline-offset-2 transition-colors duration-150"
                >
                  계정 만들기
                </Link>
              </p>

            </div>
          </div>

        </div>
      </main>

      {/* ── 푸터 ──────────────────────────────────────────────────────────── */}
      <footer className="w-full py-7 px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 max-w-[1200px] mx-auto">
        <span className="text-[12px] text-[#3e3e44]">
          © 2026 CluePot. All rights reserved.
        </span>
        <div className="flex gap-5">
          <a href="#" className="text-[12px] text-[#3e3e44] hover:text-[#8a8f98] transition-colors duration-150">
            개인정보처리방침
          </a>
          <a href="#" className="text-[12px] text-[#3e3e44] hover:text-[#8a8f98] transition-colors duration-150">
            이용약관
          </a>
        </div>
      </footer>

    </div>
  );
}

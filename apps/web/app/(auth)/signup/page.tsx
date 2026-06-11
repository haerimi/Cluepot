"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signup } from "@/app/actions/auth";

/* ── 아이콘 SVG ──────────────────────────────────────────────────────────── */

function IconUser() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
    </svg>
  );
}

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
    /* group-hover:translate-x-1 — 버튼 hover 시 화살표가 살짝 이동 */
    <svg
      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
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

function IconCheck() {
  return (
    /* 필드 입력 완료 마이크로 인터랙션용 체크 아이콘 */
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
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

/* ── 공통 인풋 래퍼 ──────────────────────────────────────────────────────── */
/* PasswordInput을 별도 컴포넌트로 분리하지 않고 trailing 슬롯으로 통합.    */
/* 완료 체크, 포커스 글로우, 아이콘 색 전환을 단일 구현으로 관리한다.        */

interface AuthInputProps {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly placeholder: string;
  readonly autoComplete?: string;
  readonly autoCapitalize?: string;
  readonly autoCorrect?: string;
  readonly inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly icon: React.ReactNode;
  /* 우측 끝에 렌더링할 추가 요소 (예: 비밀번호 표시/숨김 토글) */
  readonly trailing?: React.ReactNode;
  /* aria-describedby 연결용 */
  readonly describedBy?: string;
}

function AuthInput({
  id, name, type, placeholder,
  autoComplete, autoCapitalize, autoCorrect, inputMode,
  required, maxLength,
  icon, trailing, describedBy,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  /* 포커스/입력값 여부에 따른 테두리·배경 색상 결정 */
  const borderColor = focused ? "#5e6ad2" : hasValue ? "#34343a" : "#23252a";
  const bgColor = focused || hasValue ? "#141516" : "#0f1011";

  return (
    <div
      className="flex items-center gap-3 px-4 rounded-xl border transition-all duration-200"
      style={{
        borderColor,
        backgroundColor: bgColor,
        /* 포커스 시 라벤더 글로우 링 */
        boxShadow: focused ? "0 0 0 3px rgba(94,106,210,0.12)" : undefined,
      }}
    >
      {/* 아이콘: 포커스 또는 값 입력 완료 시 accent 색상으로 전환 */}
      <span
        className="shrink-0 transition-colors duration-200"
        style={{ color: focused ? "#bdc2ff" : hasValue ? "#62666d" : "#454652" }}
      >
        {icon}
      </span>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        inputMode={inputMode}
        required={required}
        aria-required={required}
        maxLength={maxLength}
        aria-describedby={describedBy}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
        /* py-[14px]: 상하 패딩 포함 최소 tap target 48px 확보 */
        className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#f7f8f8] placeholder:text-[#3e3e44] min-w-0 py-[14px]"
      />

      {/* trailing 슬롯 (비밀번호 토글 등) */}
      {trailing}

      {/* trailing이 없을 때만 완료 체크 표시 — 포커스 아웃 후 애니메이션 등장 */}
      {!trailing && (
        <span
          className="shrink-0 transition-all duration-300"
          style={{
            color: "#27a644",
            opacity: hasValue && !focused ? 1 : 0,
            transform: hasValue && !focused ? "scale(1)" : "scale(0.7)",
          }}
          aria-hidden="true"
        >
          <IconCheck />
        </span>
      )}
    </div>
  );
}

/* ── 비밀번호 표시/숨김 토글 버튼 ─────────────────────────────────────── */
/* AuthInput의 trailing 슬롯에 전달된다.                                    */

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
      onClick={onToggle}
      className="shrink-0 -mr-1 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] active:scale-90"
      style={{ color: show ? "#bdc2ff" : "#454652" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#c6c5d5";
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = show ? "#bdc2ff" : "#454652";
        e.currentTarget.style.backgroundColor = "";
      }}
    >
      <IconEye open={show} />
    </button>
  );
}

/* ── 폼 필드 래퍼 ────────────────────────────────────────────────────────── */
/* 라벨 + 인풋 + 힌트의 반복 구조를 단일 컴포넌트로 통합한다.               */

interface FieldProps {
  readonly label: string;
  readonly htmlFor: string;
  readonly hint?: React.ReactNode;
  readonly children: React.ReactNode;
}

function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-1.5"
        style={{ color: "#908f9e" }}
      >
        {label}
        {/* required 시각 표시 */}
        <span aria-hidden="true" className="text-[#5e6ad2]">*</span>
      </label>
      {children}
      {hint && (
        <p className="text-[11px] leading-relaxed" style={{ color: "#62666d" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── 소셜 로그인 버튼 (준비 중) ──────────────────────────────────────────── */

interface SocialButtonProps {
  readonly icon: React.ReactNode;
  readonly label: string;
}

function SocialButton({ icon, label }: SocialButtonProps) {
  return (
    <button
      type="button"
      disabled
      aria-label={`${label}로 계속하기 (준비 중)`}
      aria-disabled="true"
      className="relative flex items-center justify-center gap-2.5 h-11 rounded-xl text-[14px] font-medium cursor-not-allowed overflow-hidden"
      style={{
        backgroundColor: "#141516",
        border: "1px solid #23252a",
        color: "rgba(247,248,248,0.20)",
      }}
    >
      {icon}
      <span>{label}</span>
      {/* hover 시 "준비 중" 오버레이 */}
      <span
        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-[1px] uppercase rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-150"
        style={{ background: "rgba(14,14,17,0.85)", color: "#454652" }}
        aria-hidden="true"
      >
        준비 중
      </span>
    </button>
  );
}

/* ── 푸터 링크 ───────────────────────────────────────────────────────────── */

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-[12px] hover:underline underline-offset-2 transition-colors duration-150 hover:text-[#8a8f98]"
      style={{ color: "#3e3e44" }}
    >
      {children}
    </a>
  );
}

/* ── 페이지 ─────────────────────────────────────────────────────────────── */

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, { error: null });
  const [showPassword, setShowPassword] = useState(false);

  return (
    /* 전체 화면: 상단 accent glow가 있는 딥 다크 캔버스 */
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse 90% 45% at 50% 0%, rgba(94,106,210,0.10) 0%, #010102 58%)",
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

          {/* 우측: 로그인 링크 — HomeNav 비로그인 상태 버튼 스타일 기준 */}
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="인증 네비게이션">
            <span className="hidden sm:block text-[13px] font-medium text-[#8a8f98]">
              이미 계정이 있으신가요?
            </span>
            <Link
              href="/login"
              className="h-9 px-4 text-[13px] font-medium rounded-lg border border-[#34343a] text-[#d0d6e0] hover:text-white hover:border-[#454652] hover:bg-[#1a1a1e] flex items-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]"
            >
              로그인
            </Link>
          </nav>

        </div>
      </header>

      {/* ── 메인: 카드 중앙 배치 ──────────────────────────────────────────── */}
      <main
        className="flex-1 flex items-center justify-center px-4 sm:px-6"
        /* pt: 헤더(56px) + 여백(40px) = 96px — 헤더와 카드 사이 여유 */
        style={{ paddingTop: "96px", paddingBottom: "80px" }}
      >

        {/* 카드 컨테이너 */}
        <div
          className="w-full max-w-[440px] relative"
          style={{ animation: "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both" }}
        >

          {/* 카드 하단 빛 번짐 */}
          <div
            className="absolute -inset-8 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(94,106,210,0.09) 0%, transparent 65%)",
            }}
          />

          {/* 카드 본체 */}
          <div
            className="relative bg-[#0f1011] border border-[#23252a] rounded-2xl overflow-hidden"
            style={{
              boxShadow:
                "0 32px 72px rgba(0,0,0,0.60), 0 1px 0 rgba(255,255,255,0.05) inset",
            }}
          >
            {/* 앰비언트 글로우 오버레이 */}
            <div className="glass-glow" />

            {/* 카드 상단 accent 라인 */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#5e6ad2]/50 to-transparent" />

            {/* 카드 콘텐츠 */}
            <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">

              {/* 카드 헤더 */}
              <div className="mb-7 text-center">
                {/* eyebrow 배지 — 스태거 애니메이션 */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 mb-4"
                  style={{ animation: "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
                  <span className="text-[11px] font-bold text-[#bdc2ff] tracking-[1.5px] uppercase">
                    회원가입
                  </span>
                </div>
                <h1
                  id="signup-heading"
                  className="text-[26px] sm:text-[30px] font-black text-[#e5e1e6] tracking-tight leading-tight mb-3"
                  style={{ animation: "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
                >
                  CluePot에 오신 것을
                  <br />
                  환영해요
                </h1>
                <p
                  className="text-[14px] text-[#8a8f98] leading-relaxed"
                  style={{ animation: "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
                >
                  이메일과 닉네임으로 시작하세요.
                </p>
              </div>

              {/* 구분선 */}
              <div className="h-px bg-[#18181c] mb-7" />

              {/* 회원가입 폼 — aria-labelledby로 h1과 연결 */}
              <form action={action} aria-label="회원가입 폼" aria-labelledby="signup-heading">
                <div className="flex flex-col gap-5">

                  <Field label="닉네임" htmlFor="nickname">
                    <AuthInput
                      id="nickname"
                      name="nickname"
                      type="text"
                      placeholder="모임에서 불릴 이름"
                      autoComplete="nickname"
                      autoCapitalize="off"
                      autoCorrect="off"
                      required
                      maxLength={20}
                      icon={<IconUser />}
                    />
                  </Field>

                  <Field label="이메일" htmlFor="email">
                    <AuthInput
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      autoCapitalize="off"
                      autoCorrect="off"
                      inputMode="email"
                      required
                      icon={<IconMail />}
                    />
                  </Field>

                  <Field
                    label="비밀번호"
                    htmlFor="password"
                    /* id="password-hint" — AuthInput 내부의 aria-describedby와 연결 */
                    hint={
                      <span
                        id="password-hint"
                        /* pl: 좌패딩(16px) + 아이콘(18px) + gap(12px) = 46px — 인풋 텍스트와 정렬 */
                        style={{ paddingLeft: "46px", display: "block" }}
                      >
                        최소 8자 이상이어야 해요.
                      </span>
                    }
                  >
                    <AuthInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="8자 이상"
                      autoComplete="new-password"
                      required
                      describedBy="password-hint"
                      icon={<IconLock />}
                      trailing={
                        <PasswordToggle
                          show={showPassword}
                          onToggle={() => setShowPassword((p) => !p)}
                        />
                      }
                    />
                  </Field>

                </div>

                {/* 에러 메시지 — aria-live로 스크린리더 즉시 읽기 */}
                {/* key={state.error}로 새로운 에러마다 fade-up 재실행 */}
                <div aria-live="assertive" aria-atomic="true">
                  {state?.error && (
                    <div
                      key={state.error}
                      className="flex items-start gap-2.5 mt-5 text-[13px] text-[#ffb4ab] bg-[#93000a]/20 border border-[#93000a]/40 rounded-xl px-4 py-3"
                      role="alert"
                      style={{ animation: "fade-up 0.2s ease-out both" }}
                    >
                      <IconWarning />
                      <span>{state.error}</span>
                    </div>
                  )}
                </div>

                {/* CTA 구분 — 폼 필드와 버튼 사이 시각 분리 */}
                <div className="h-px bg-[#18181c] mt-6 mb-5" />

                {/* 계정 만들기 버튼 */}
                <button
                  type="submit"
                  disabled={pending}
                  className={[
                    /* group — IconArrow의 group-hover:translate-x-1과 연동 */
                    "group h-[52px] w-full rounded-xl",
                    "bg-[#5e6ad2] text-white text-[15px] font-bold",
                    "flex items-center justify-center gap-2.5",
                    "transition-all duration-200 active:scale-[0.97]",
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
                      <span>계정 만드는 중…</span>
                    </>
                  ) : (
                    <>
                      <span>계정 만들기</span>
                      <IconArrow />
                    </>
                  )}
                </button>

              </form>

              {/* 구분선 */}
              <div className="flex items-center gap-4 my-7">
                <div className="flex-1 h-px bg-[#1e1e22]" />
                <span className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "#3e3e44" }}>
                  또는
                </span>
                <div className="flex-1 h-px bg-[#1e1e22]" />
              </div>

              {/* 소셜 로그인 — 추후 연동 예정 */}
              <div className="grid grid-cols-2 gap-3">
                <SocialButton icon={<IconGoogle />} label="Google" />
                <SocialButton icon={<IconGithub />} label="GitHub" />
              </div>

              {/* 로그인 링크 */}
              <p className="mt-7 text-center text-[14px] text-[#8a8f98]">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#bdc2ff] hover:text-white hover:underline underline-offset-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] rounded"
                >
                  로그인
                </Link>
              </p>

            </div>
          </div>

        </div>
      </main>

      {/* ── 푸터 ──────────────────────────────────────────────────────────── */}
      <footer className="w-full py-7 px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 max-w-[1200px] mx-auto">
        <span className="text-[12px]" style={{ color: "#2e2e34" }}>
          © 2026 CluePot. All rights reserved.
        </span>
        <div className="flex gap-5">
          <FooterLink href="#">개인정보처리방침</FooterLink>
          <FooterLink href="#">이용약관</FooterLink>
        </div>
      </footer>

    </div>
  );
}

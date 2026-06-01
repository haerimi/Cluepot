"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

/* ── PINI ambient orb ───────────────────────────────────────────────── */
function PiniOrb() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <div
        className="absolute w-16 h-16 rounded-full border border-accent/25 pointer-events-none"
        style={{ animation: "ring-pulse 2.6s ease-out infinite" }}
      />
      <div
        className="absolute w-16 h-16 rounded-full border border-accent/15 pointer-events-none"
        style={{ animation: "ring-pulse 2.6s ease-out 1.3s infinite" }}
      />
      <div className="absolute w-28 h-28 rounded-full border border-dashed border-accent/10 pointer-events-none" />
      <div
        className="relative z-10 w-14 h-14 rounded-full bg-accent flex items-center justify-center"
        style={{
          boxShadow:
            "0 4px 32px rgba(114,152,199,0.45), 0 2px 8px rgba(114,152,199,0.28)",
          animation: "float-slow 3.2s ease-in-out infinite",
        }}
      >
        <span className="text-2xl leading-none select-none">🔍</span>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, { error: null });

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">

      {/* ══ Left: dark editorial panel (desktop) ══════════════════════════ */}
      <div className="hidden lg:flex lg:w-[54%] bg-ink flex-col justify-between px-16 py-14 relative overflow-hidden">

        <div
          className="absolute right-[-6rem] top-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full pointer-events-none"
          style={{ background: "rgba(114,152,199,0.07)", filter: "blur(80px)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, #ffffff 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <Link
            href="/"
            className="text-[18px] font-black text-white tracking-tight hover:opacity-70 transition-opacity"
          >
            Clue<span className="text-accent">Pot</span>
          </Link>
        </div>

        {/* Editorial center content */}
        <div className="relative z-10 flex flex-col gap-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-px bg-accent" />
            <span className="text-[10px] font-bold text-accent tracking-[3.5px] uppercase">
              새 계정
            </span>
          </div>

          <h1
            className="text-[64px] xl:text-[80px] font-black text-white leading-[0.90] tracking-[-3px]"
            style={{ animation: "cinematic-up 0.8s ease-out both" }}
          >
            새로운
            <br />
            모임의
            <br />
            <span className="text-accent">시작</span>
          </h1>

          <div className="w-10 h-px bg-dark" />

          <p className="text-[14px] text-ink-subtle leading-[1.85] max-w-[320px]">
            계정을 만들면 나의 모임 일정을
            <br />
            한 곳에서 관리할 수 있어요.
          </p>

          <PiniOrb />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-5 h-px bg-dark" />
          <span className="text-[10px] font-bold text-ink-muted tracking-[2.5px] uppercase">
            PINI Mode · AI 모임 조율
          </span>
        </div>
      </div>

      {/* ══ Mobile header ═══════════════════════════════════════════════════ */}
      <div className="lg:hidden bg-ink px-6 pt-10 pb-8 relative overflow-hidden">
        <div
          className="absolute right-[-4rem] top-1/2 -translate-y-1/2 w-[18rem] h-[18rem] rounded-full pointer-events-none"
          style={{ background: "rgba(114,152,199,0.08)", filter: "blur(60px)" }}
        />
        <Link
          href="/"
          className="text-[17px] font-black text-white tracking-tight"
        >
          Clue<span className="text-accent">Pot</span>
        </Link>
        <h1 className="mt-5 text-[40px] font-black text-white leading-[0.92] tracking-[-2px]">
          새로운
          <br />
          모임의
          <br />
          <span className="text-accent">시작</span>
        </h1>
        <p className="mt-5 text-[13px] text-ink-subtle leading-[1.8]">
          계정을 만들고 모임 일정을 관리하세요.
        </p>
      </div>

      {/* ══ Right: form panel ══════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 bg-canvas">
        <div className="w-full max-w-[380px]">

          {/* Form heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-hairline-strong" />
              <span className="text-[10px] font-bold text-ink-subtle tracking-[3px] uppercase">
                계정 만들기
              </span>
            </div>
            <h2 className="text-[28px] font-black text-ink leading-tight tracking-[-1px]">
              CluePot에 오신 것을
              <br />
              환영해요
            </h2>
            <p className="mt-2 text-[13px] text-ink-subtle">
              이메일과 닉네임으로 시작하세요.
            </p>
          </div>

          <form action={action} className="flex flex-col gap-4">
            {/* Nickname */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="nickname"
                className="text-[11px] font-semibold text-ink-muted tracking-wide uppercase"
              >
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                autoComplete="nickname"
                required
                maxLength={20}
                placeholder="모임에서 불릴 이름"
                className="h-12 px-4 bg-white border border-hairline rounded-[10px] text-[16px] text-ink placeholder:text-ink-subtle outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(114,152,199,0.10)]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[11px] font-semibold text-ink-muted tracking-wide uppercase"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                className="h-12 px-4 bg-white border border-hairline rounded-[10px] text-[16px] text-ink placeholder:text-ink-subtle outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(114,152,199,0.10)]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[11px] font-semibold text-ink-muted tracking-wide uppercase"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="8자 이상"
                className="h-12 px-4 bg-white border border-hairline rounded-[10px] text-[16px] text-ink placeholder:text-ink-subtle outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(114,152,199,0.10)]"
              />
              <p className="text-[11px] text-ink-subtle">최소 8자 이상이어야 해요.</p>
            </div>

            {/* Error */}
            {state?.error && (
              <p
                className="text-[13px] text-error bg-error-bg border border-error-border rounded-lg px-4 py-3"
                role="alert"
                style={{ animation: "fade-up 0.2s ease-out both" }}
              >
                {state.error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 h-12 w-full rounded-[10px] bg-accent text-white text-[15px] font-semibold transition-all hover:bg-accent-hover active:bg-accent-active disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ boxShadow: "0 1px 3px rgba(114,152,199,0.35)" }}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  계정 만드는 중…
                </span>
              ) : (
                "계정 만들기"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-hairline" />
            <span className="text-[11px] text-ink-subtle uppercase tracking-wider">
              또는
            </span>
            <div className="flex-1 h-px bg-hairline" />
          </div>

          {/* Switch to login */}
          <p className="text-center text-[13px] text-ink-subtle">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

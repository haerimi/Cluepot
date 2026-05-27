"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

/* ── Watson ambient orb — reused from the home hero ─────────────────── */
function WatsonOrb() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <div
        className="absolute w-16 h-16 rounded-full border border-[#7C5CFC]/25 pointer-events-none"
        style={{ animation: "ring-pulse 2.6s ease-out infinite" }}
      />
      <div
        className="absolute w-16 h-16 rounded-full border border-[#7C5CFC]/15 pointer-events-none"
        style={{ animation: "ring-pulse 2.6s ease-out 1.3s infinite" }}
      />
      <div className="absolute w-28 h-28 rounded-full border border-dashed border-[#7C5CFC]/10 pointer-events-none" />
      <div
        className="relative z-10 w-14 h-14 rounded-full bg-[#7C5CFC] flex items-center justify-center"
        style={{
          boxShadow:
            "0 4px 32px rgba(124,92,252,0.45), 0 2px 8px rgba(124,92,252,0.28)",
          animation: "float-slow 3.2s ease-in-out infinite",
        }}
      >
        <span className="text-2xl leading-none select-none">🔍</span>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [state, action, pending] = useActionState(login, { error: null });

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">

      {/* ══ Left: dark editorial panel (desktop) ══════════════════════════ */}
      <div className="hidden lg:flex lg:w-[54%] bg-[#1C1A17] flex-col justify-between px-16 py-14 relative overflow-hidden">

        {/* Ambient accent glow */}
        <div
          className="absolute right-[-6rem] top-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full pointer-events-none"
          style={{ background: "rgba(124,92,252,0.07)", filter: "blur(80px)" }}
        />
        {/* Dot grid texture */}
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
            Clue<span className="text-[#7C5CFC]">Pot</span>
          </Link>
        </div>

        {/* Editorial center content */}
        <div className="relative z-10 flex flex-col gap-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-px bg-[#7C5CFC]" />
            <span className="text-[10px] font-bold text-[#7C5CFC] tracking-[3.5px] uppercase">
              AI 모임 조율 플랫폼
            </span>
          </div>

          {/* Large headline */}
          <h1
            className="text-[64px] xl:text-[80px] font-black text-white leading-[0.90] tracking-[-3px]"
            style={{ animation: "cinematic-up 0.8s ease-out both" }}
          >
            다시,
            <br />
            모임의
            <br />
            <span className="text-[#7C5CFC]">중심으로</span>
          </h1>

          {/* Thin editorial rule */}
          <div className="w-10 h-px bg-[#2D2B28]" />

          {/* Supporting copy */}
          <p className="text-[14px] text-[#908D87] leading-[1.85] max-w-[320px]">
            Watson이 참가자 모두의 위치와 이동수단,
            <br />
            분위기를 분석해 공정한 장소를 찾아드려요.
          </p>

          {/* Watson orb */}
          <WatsonOrb />
        </div>

        {/* Bottom ambient label */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-5 h-px bg-[#2D2B28]" />
          <span className="text-[10px] font-bold text-[#4A4740] tracking-[2.5px] uppercase">
            Watson Mode · AI 모임 조율
          </span>
        </div>
      </div>

      {/* ══ Mobile header — dark banner ════════════════════════════════════ */}
      <div className="lg:hidden bg-[#1C1A17] px-6 pt-10 pb-8 relative overflow-hidden">
        <div
          className="absolute right-[-4rem] top-1/2 -translate-y-1/2 w-[18rem] h-[18rem] rounded-full pointer-events-none"
          style={{ background: "rgba(124,92,252,0.08)", filter: "blur(60px)" }}
        />
        <Link
          href="/"
          className="text-[17px] font-black text-white tracking-tight"
        >
          Clue<span className="text-[#7C5CFC]">Pot</span>
        </Link>
        <h1 className="mt-5 text-[40px] font-black text-white leading-[0.92] tracking-[-2px]">
          다시,
          <br />
          모임의
          <br />
          <span className="text-[#7C5CFC]">중심으로</span>
        </h1>
        <p className="mt-5 text-[13px] text-[#908D87] leading-[1.8]">
          Watson이 공정한 모임 장소를 찾아드려요.
        </p>
      </div>

      {/* ══ Right: form panel ══════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 bg-[#F4F2EE]">
        <div className="w-full max-w-[380px]">

          {/* Form heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-[#D0CCC4]" />
              <span className="text-[10px] font-bold text-[#908D87] tracking-[3px] uppercase">
                로그인
              </span>
            </div>
            <h2 className="text-[28px] font-black text-[#1C1A17] leading-tight tracking-[-1px]">
              다시 오셨군요
            </h2>
            <p className="mt-2 text-[13px] text-[#908D87]">
              계정에 로그인해 모임을 이어가세요.
            </p>
          </div>

          <form action={action} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[11px] font-semibold text-[#4A4740] tracking-wide uppercase"
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
                className="h-12 px-4 bg-white border border-[#E5E1D9] rounded-[10px] text-[15px] text-[#1C1A17] placeholder:text-[#C4C1BC] outline-none transition-all focus:border-[#7C5CFC] focus:shadow-[0_0_0_3px_rgba(124,92,252,0.10)]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[11px] font-semibold text-[#4A4740] tracking-wide uppercase"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-12 px-4 bg-white border border-[#E5E1D9] rounded-[10px] text-[15px] text-[#1C1A17] placeholder:text-[#C4C1BC] outline-none transition-all focus:border-[#7C5CFC] focus:shadow-[0_0_0_3px_rgba(124,92,252,0.10)]"
              />
            </div>

            {/* Error */}
            {state?.error && (
              <p
                className="text-[13px] text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg px-4 py-3"
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
              className="mt-2 h-12 w-full rounded-[10px] bg-[#7C5CFC] text-white text-[15px] font-semibold transition-all hover:bg-[#6B4AEF] active:bg-[#5A38E3] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                boxShadow: "0 1px 3px rgba(124,92,252,0.35)",
              }}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  로그인 중…
                </span>
              ) : (
                "로그인하기"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[#E5E1D9]" />
            <span className="text-[11px] text-[#C4C1BC] uppercase tracking-wider">
              또는
            </span>
            <div className="flex-1 h-px bg-[#E5E1D9]" />
          </div>

          {/* Switch to signup */}
          <p className="text-center text-[13px] text-[#908D87]">
            처음이세요?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#7C5CFC] hover:text-[#6B4AEF] transition-colors"
            >
              계정 만들기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

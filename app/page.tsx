import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/util/supabase/server";
import { logout } from "@/app/actions/auth";
import { Button } from "@/app/components/ui/Button";

/* ── Enlarged cinematic hero visualization ───────────────────────────────── */
function PiniHeroViz() {
  return (
    <div className="relative w-full h-full min-h-[360px] lg:min-h-[560px] flex items-center justify-center overflow-hidden">

      {/* Ambient glow */}
      <div
        className="absolute w-48 h-48 lg:w-80 lg:h-80 rounded-full bg-[#7C5CFC]/8 blur-3xl pointer-events-none"
        style={{ animation: "float-slow 5s ease-in-out infinite" }}
      />

      {/* Expanding pulse rings */}
      <div
        className="absolute w-24 h-24 lg:w-36 lg:h-36 rounded-full border border-[#7C5CFC]/30 pointer-events-none"
        style={{ animation: "ring-pulse 2.4s ease-out infinite" }}
      />
      <div
        className="absolute w-24 h-24 lg:w-36 lg:h-36 rounded-full border border-[#7C5CFC]/20 pointer-events-none"
        style={{ animation: "ring-pulse 2.4s ease-out 1.2s infinite" }}
      />

      {/* Orbit path rings */}
      <div className="absolute w-56 h-56 lg:w-[340px] lg:h-[340px] rounded-full border border-dashed border-[#7C5CFC]/10 pointer-events-none" />
      <div className="absolute w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full border border-dashed border-[#D0CCC4]/20 pointer-events-none" />

      {/* Center PINI orb — enlarged */}
      <div
        className="relative z-20 w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-[#7C5CFC] flex items-center justify-center"
        style={{
          boxShadow: "0 8px 48px rgba(124,92,252,0.42), 0 2px 12px rgba(124,92,252,0.28)",
          animation: "float-slow 3s ease-in-out infinite",
        }}
      >
        <span className="text-4xl lg:text-5xl leading-none select-none">🔍</span>
      </div>

      {/* Participant — top-left */}
      <div
        className="absolute z-10 top-[14%] left-[10%] flex flex-col items-center gap-2"
        style={{ animation: "float-slow 4.2s ease-in-out 0.5s infinite" }}
      >
        <div className="w-14 h-14 lg:w-18 lg:h-18 rounded-full bg-white border-2 border-[#E5E1D9] shadow-[0_4px_20px_rgba(28,26,23,0.12)] flex items-center justify-center">
          <span className="text-2xl lg:text-3xl leading-none select-none">🐶</span>
        </div>
        <div className="px-3 py-1 bg-white rounded-full border border-[#E5E1D9] shadow-sm">
          <span className="text-[11px] lg:text-[13px] font-medium text-[#908D87]">강남구</span>
        </div>
      </div>

      {/* Participant — top-right */}
      <div
        className="absolute z-10 top-[10%] right-[9%] flex flex-col items-center gap-2"
        style={{ animation: "float-slow 3.6s ease-in-out 1.1s infinite" }}
      >
        <div className="w-14 h-14 lg:w-18 lg:h-18 rounded-full bg-white border-2 border-[#E5E1D9] shadow-[0_4px_20px_rgba(28,26,23,0.12)] flex items-center justify-center">
          <span className="text-2xl lg:text-3xl leading-none select-none">🐧</span>
        </div>
        <div className="px-3 py-1 bg-white rounded-full border border-[#E5E1D9] shadow-sm">
          <span className="text-[11px] lg:text-[13px] font-medium text-[#908D87]">마포구</span>
        </div>
      </div>

      {/* Participant — bottom-center */}
      <div
        className="absolute z-10 bottom-[14%] left-[38%] flex flex-col items-center gap-2"
        style={{ animation: "float-slow 4.8s ease-in-out 0.3s infinite" }}
      >
        <div className="w-14 h-14 lg:w-18 lg:h-18 rounded-full bg-white border-2 border-[#E5E1D9] shadow-[0_4px_20px_rgba(28,26,23,0.12)] flex items-center justify-center">
          <span className="text-2xl lg:text-3xl leading-none select-none">🐿️</span>
        </div>
        <div className="px-3 py-1 bg-white rounded-full border border-[#E5E1D9] shadow-sm">
          <span className="text-[11px] lg:text-[13px] font-medium text-[#908D87]">잠실</span>
        </div>
      </div>

      {/* Analysis chip */}
      <div
        className="absolute z-10 bottom-[22%] right-[7%]"
        style={{ animation: "float-slow 5s ease-in-out 2s infinite" }}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#7C5CFC]/25 shadow-md">
          <div className="flex gap-1">
            {([0, 0.15, 0.3] as const).map((d) => (
              <div
                key={d}
                className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]"
                style={{ animation: `dot-bounce 1.2s ease-in-out ${d}s infinite` }}
              />
            ))}
          </div>
          <span className="text-[12px] lg:text-[13px] font-semibold text-[#7C5CFC]">분석 중</span>
        </div>
      </div>

      {/* Result chip */}
      <div
        className="absolute z-10 top-[32%] left-[40%]"
        style={{ animation: "float-slow 4s ease-in-out 3s infinite" }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5EC] rounded-full border border-[#27A644]/20 shadow-sm">
          <span className="text-[11px]">✓</span>
          <span className="text-[11px] lg:text-[12px] font-semibold text-[#1A7A35]">추천 완료</span>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const displayName = (user?.user_metadata?.nickname as string | undefined)
    || user?.email?.split("@")[0]
    || "";
  const initial = displayName[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-dvh bg-[#F4F2EE] overflow-x-hidden">

      {/* ── Fixed navigation bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 h-14 bg-[#F4F2EE]/92 backdrop-blur-sm border-b border-[#E5E1D9]">
        <span className="text-[18px] font-black text-[#1C1A17] tracking-tight">
          Clue<span className="text-[#7C5CFC]">Pot</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/room/join"
            className="hidden sm:block text-[13px] font-medium text-[#908D87] hover:text-[#1C1A17] transition-colors"
          >
            코드로 참가
          </Link>

          {user ? (
            <>
              {/* 내 일정 · 내 모임 바로가기 */}
              <Link
                href="/calendar"
                className="text-[13px] font-medium text-[#908D87] hover:text-[#1C1A17] transition-colors"
              >
                내 일정
              </Link>
              <Link
                href="/rooms"
                className="text-[13px] font-medium text-[#908D87] hover:text-[#1C1A17] transition-colors"
              >
                내 모임
              </Link>

              {/* 유저 뱃지 + 로그아웃 */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 h-9 bg-white border border-[#E5E1D9] rounded-full">
                  <div className="w-5 h-5 rounded-full bg-[#7C5CFC] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white leading-none">{initial}</span>
                  </div>
                  <span className="text-[13px] font-medium text-[#1C1A17] hidden sm:block">{displayName}</span>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="h-9 px-3 text-[12px] font-medium text-[#908D87] border border-[#E5E1D9] rounded-full hover:text-[#1C1A17] hover:border-[#D0CCC4] bg-white transition-colors cursor-pointer"
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            </>
          ) : (
            <Link href="/login">
              <span className="inline-flex items-center h-9 px-4 border border-[#E5E1D9] text-[#1C1A17] text-[13px] font-medium rounded-full hover:border-[#D0CCC4] bg-white transition-colors cursor-pointer">
                로그인
              </span>
            </Link>
          )}

          {!user && (
            <Link href="/room/create">
              <span className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#1C1A17] text-white text-[13px] font-semibold rounded-full hover:bg-[#2D2B28] transition-colors cursor-pointer">
                새 모임 만들기
              </span>
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section className="min-h-dvh pt-14 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: editorial text column */}
        <div
          className="flex flex-col justify-center px-6 lg:pl-16 lg:pr-12 pt-14 lg:pt-0 pb-10 lg:pb-0 lg:w-[52%] lg:border-r lg:border-[#E5E1D9]"
          style={{ animation: "cinematic-up 0.8s ease-out both" }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8 lg:mb-12">
            <div className="w-6 h-px bg-[#7C5CFC]" />
            <span className="text-[11px] font-bold text-[#7C5CFC] tracking-[3px] uppercase">
              AI 모임 조율 플랫폼
            </span>
          </div>

          {/* Cinematic headline */}
          <h1 className="text-[52px] sm:text-[68px] lg:text-[76px] xl:text-[92px] font-black text-[#1C1A17] leading-[0.90] tracking-[-3px] mb-10">
            모임의
            <br />
            중심을
            <br />
            <span className="text-[#7C5CFC]">찾다</span>
          </h1>

          {/* Thin editorial rule */}
          <div className="w-12 h-px bg-[#D0CCC4] mb-8" />

          {/* Subtitle */}
          <p className="text-[15px] lg:text-[16px] text-[#908D87] leading-[1.75] mb-10 lg:mb-12 max-w-[360px]">
            참가자 위치·교통수단·분위기 선호를 분석해
            <br />
            모두에게 공정한 장소를 추천해드려요
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12 lg:mb-16">
            <Link href="/room/create">
              <Button variant="primary" size="lg">
                <svg width="16" height="16" viewBox="0 0 17 17" fill="none" aria-hidden="true">
                  <path d="M8.5 2.5V14.5M2.5 8.5H14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                새 모임 만들기
              </Button>
            </Link>
            <Link href="/room/join">
              <Button variant="secondary" size="lg">
                코드로 참가하기
              </Button>
            </Link>
          </div>

          {/* Trust line */}
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#C4C1BC] uppercase tracking-widest font-medium">Powered by</span>
            <div className="h-px w-12 bg-[#E5E1D9]" />
            <span className="text-[12px] font-bold text-[#7C5CFC] tracking-wide">PINI Mode</span>
          </div>
        </div>

        {/* Right: visualization panel */}
        <div
          className="lg:w-[48%] relative flex items-center justify-center min-h-[360px] lg:min-h-0 overflow-hidden"
          style={{ animation: "section-fade 1.2s ease-out 0.3s both" }}
        >
          {/* Subtle dot grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1.5px 1.5px, #1C1A17 1.5px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <PiniHeroViz />
        </div>
      </section>

      {/* ── Thin divider ── */}
      <div className="h-px bg-[#E5E1D9]" />

      {/* ── Philosophy section: dark contrast ───────────────────────────── */}
      <section className="bg-[#1C1A17] py-24 lg:py-36 px-6 lg:px-16 relative overflow-hidden">
        {/* Ambient accent glow */}
        <div className="absolute right-[-8rem] top-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-[#7C5CFC]/6 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-14 lg:mb-20">
            <div className="w-8 h-px bg-[#7C5CFC]" />
            <span className="text-[11px] font-bold text-[#7C5CFC] tracking-[3px] uppercase">
              PINI 철학
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-start">

            {/* Left: large statement */}
            <div>
              <h2 className="text-[38px] sm:text-[52px] lg:text-[64px] font-black text-white leading-[1.0] tracking-[-2px] mb-8">
                다수결이
                <br />
                아닙니다.
                <br />
                <span className="text-[#7C5CFC]">모두를 위해</span>
                <br />
                조율해요
              </h2>
              <p className="text-[14px] lg:text-[15px] text-[#908D87] leading-[1.8] max-w-[320px]">
                한 명에게 불리한 선택은 하지 않아요.
                피니는 모든 참가자의 위치·이동 방식·
                분위기 선호를 동등하게 고려해 장소를 조율해요.
              </p>
            </div>

            {/* Right: principles list */}
            <div>
              {[
                {
                  label: "01",
                  title: "이동 부담 균등화",
                  desc: "한 명이 멀리 이동하고 나머지가 편한 선택은 제외해요. 최대·최소 이동 시간 차이를 최소화해요.",
                },
                {
                  label: "02",
                  title: "분위기 선호 조율",
                  desc: "각자의 취향을 수치화해 최대한 많은 참가자가 만족할 분위기의 장소를 찾아요.",
                },
                {
                  label: "03",
                  title: "리뷰 신뢰 검증",
                  desc: "광고성 후기와 실제 방문자 후기를 구분해, 신뢰할 수 있는 정보만 추천에 활용해요.",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex gap-6 py-8 border-t border-[#2D2B28]"
                  style={{ animation: `fade-up 0.5s ease-out ${0.1 + i * 0.12}s both` }}
                >
                  <span className="text-[13px] font-bold text-[#4A4740] tabular-nums shrink-0 pt-0.5 w-6">
                    {item.label}
                  </span>
                  <div>
                    <p className="text-[15px] font-bold text-white mb-2">{item.title}</p>
                    <p className="text-[13px] text-[#908D87] leading-[1.75]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Thin divider ── */}
      <div className="h-px bg-[#E5E1D9]" />

      {/* ── How it works section ─────────────────────────────────────────── */}
      <section className="py-24 lg:py-36 px-6 lg:px-16 bg-[#F4F2EE]">
        <div className="max-w-7xl mx-auto">

          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-16 lg:mb-20">
            <div className="w-8 h-px bg-[#D0CCC4]" />
            <span className="text-[11px] font-bold text-[#908D87] tracking-[3px] uppercase">
              어떻게 작동하나요
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-start">

            {/* Left: editorial heading — sticky on desktop */}
            <div className="lg:sticky lg:top-28">
              <h2 className="text-[36px] sm:text-[48px] lg:text-[58px] font-black text-[#1C1A17] leading-[1.0] tracking-[-2px] mb-6">
                참가자 모두의
                <br />
                상황을
                <br />
                <span className="text-[#7C5CFC]">읽어요</span>
              </h2>
              <p className="text-[14px] lg:text-[15px] text-[#908D87] leading-[1.8] max-w-[340px]">
                피니는 위치 데이터가 아닌 동선 패턴을 분석해요.
                누가 어디서 오는지, 어떤 방식으로 이동하는지를 종합해
                공정한 중간 지점을 탐색해요.
              </p>
            </div>

            {/* Right: step cards */}
            <div className="space-y-4">
              {[
                {
                  step: "01",
                  icon: "📍",
                  title: "출발 지역 입력",
                  desc: "각 참가자가 출발 지역·교통수단·이동 거리 선호를 입력해요. 정확한 주소가 아닌 동 단위로도 충분해요.",
                },
                {
                  step: "02",
                  icon: "⚖️",
                  title: "PINI 조율",
                  desc: "AI가 모든 참가자의 이동 균형을 계산하고, 분위기 선호를 겹쳐서 최적 후보군을 생성해요.",
                },
                {
                  step: "03",
                  icon: "🔍",
                  title: "리뷰 신뢰도 검증",
                  desc: "광고성 후기를 필터링하고 실제 방문자 경험을 추출해 각 장소의 신뢰 점수를 계산해요.",
                },
                {
                  step: "04",
                  icon: "✓",
                  title: "이유와 함께 추천",
                  desc: "왜 이 장소인지 피니가 직접 설명해요. 균형도 수치와 참가자별 이동 시간을 투명하게 공개해요.",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="group flex gap-5 p-6 bg-white rounded-2xl border border-[#E5E1D9] shadow-[0_1px_4px_rgba(28,26,23,0.06)] hover:border-[#D0CCC4] hover:shadow-[0_4px_16px_rgba(28,26,23,0.08)] transition-all duration-300"
                  style={{ animation: `fade-up 0.45s ease-out ${i * 0.09}s both` }}
                >
                  <div className="shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-[#F0ECFF] flex items-center justify-center text-xl">
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[11px] font-bold text-[#7C5CFC] tracking-wider">{item.step}</span>
                      <div className="w-px h-3 bg-[#D0CCC4]" />
                      <p className="text-[15px] font-bold text-[#1C1A17]">{item.title}</p>
                    </div>
                    <p className="text-[13px] text-[#908D87] leading-[1.7]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Thin divider ── */}
      <div className="h-px bg-[#E5E1D9]" />

      {/* ── Feature strip ──────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#E5E1D9]">
            {[
              { emoji: "🔍", title: "PINI Mode", desc: "AI 기반 공정한 장소 조율" },
              { emoji: "📍", title: "공정한 중간지점", desc: "이동 부담을 균등하게 분배" },
              { emoji: "🚇", title: "교통수단 반영", desc: "도보·지하철·자가용 모두 고려" },
              { emoji: "⚡", title: "실시간 추천", desc: "분위기·취향까지 반영한 맞춤 제안" },
            ].map((f, i) => (
              <div
                key={f.title}
                className="flex flex-col gap-4 lg:px-10 lg:first:pl-0 lg:last:pr-0 border-t-2 border-[#E5E1D9] lg:border-t-0 pt-6 lg:pt-0"
                style={{ animation: `fade-up 0.4s ease-out ${i * 0.07}s both` }}
              >
                <span className="text-2xl">{f.emoji}</span>
                <div>
                  <p className="text-[14px] font-bold text-[#1C1A17] mb-1">{f.title}</p>
                  <p className="text-[12px] text-[#908D87] leading-[1.6]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Thin divider ── */}
      <div className="h-px bg-[#E5E1D9]" />

      {/* ── CTA section ────────────────────────────────────────────────────── */}
      <section className="py-28 lg:py-40 px-6 lg:px-16 bg-[#F4F2EE] relative overflow-hidden">
        {/* Large ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full bg-[#7C5CFC]/4 blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          {/* Editorial divider */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="h-px w-16 bg-[#D0CCC4]" />
            <span className="text-[11px] font-bold text-[#908D87] tracking-[3px] uppercase">지금 시작하기</span>
            <div className="h-px w-16 bg-[#D0CCC4]" />
          </div>

          <h2 className="text-[40px] sm:text-[56px] lg:text-[72px] font-black text-[#1C1A17] leading-[0.93] tracking-[-2.5px] mb-10">
            모두가 만족하는
            <br />
            <span className="text-[#7C5CFC]">장소를 찾아요</span>
          </h2>

          <p className="text-[14px] lg:text-[15px] text-[#908D87] leading-[1.8] mb-12 max-w-[400px] mx-auto">
            위치 데이터는 저장하지 않아요.
            분석 후 즉시 삭제되며, 카카오맵 기반으로 운영돼요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/room/create">
              <Button variant="primary" size="lg" className="sm:min-w-[200px]">
                <svg width="16" height="16" viewBox="0 0 17 17" fill="none" aria-hidden="true">
                  <path d="M8.5 2.5V14.5M2.5 8.5H14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                새 모임 만들기
              </Button>
            </Link>
            <Link href="/room/join">
              <Button variant="secondary" size="lg" className="sm:min-w-[200px]">
                코드로 참가하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E1D9] px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[17px] font-black text-[#1C1A17] tracking-tight">
            Clue<span className="text-[#7C5CFC]">Pot</span>
          </span>
          <p className="text-[12px] text-[#C4C1BC]">
            카카오맵 기반 · 위치 데이터는 저장되지 않아요
          </p>
        </div>
      </footer>
    </div>
  );
}

import { LandingCtaButtons } from "./LandingShared";

/**
 * 히어로 섹션 — 중앙 정렬 헤드라인 + 하단 제품 UI 프리뷰
 * PiniHeroViz 대체: 다크 테마 앱 목업으로 서비스 핵심 가치 시각화
 */

/* ── 모듈 스코프 정적 데이터 ────────────────────────────────── */
const PARTICIPANTS = [
  { initials: "강", color: "#3a4a9e", name: "강남구", done: true },
  { initials: "마", color: "#2d5c8e", name: "마포구", done: true },
  { initials: "잠", color: "#3d6b6b", name: "잠실", done: true },
  { initials: "서", color: "#6b3d6b", name: "서초구", done: false },
] as const;

const PLACES = [
  { name: "홍대입구역 카페거리", score: 94, width: "94%" },
  { name: "신촌 문화공원 주변", score: 89, width: "89%" },
] as const;

const MOBILE_AVATARS = [
  { initials: "강", color: "#3a4a9e" },
  { initials: "마", color: "#2d5c8e" },
  { initials: "잠", color: "#3d6b6b" },
] as const;

/* ── 앱 UI 목업 (히어로 스크린샷 대용) ─────────────────────── */
function PiniUIMockup() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: "#0d0d10" }}
      aria-hidden="true"
    >
      {/* 목업 상단 타이틀 바 */}
      <div
        className="flex items-center justify-between px-4 sm:px-5 h-10 sm:h-11 border-b shrink-0"
        style={{ borderColor: "#23252a" }}
      >
        <div className="flex items-center gap-2">
          {/* 트래픽 라이트 */}
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a3a3e" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a3a3e" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a3a3e" }} />
          </div>
          <span
            className="ml-2 text-[11px] font-mono font-medium tracking-widest"
            style={{ color: "#8a8f98" }}
          >
            ALPHA7
          </span>
        </div>
        <div
          className="h-6 px-3 rounded text-[11px] font-semibold flex items-center gap-1.5"
          style={{ background: "rgba(94,106,210,0.2)", color: "#bdc2ff", border: "1px solid rgba(94,106,210,0.3)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#bdc2ff", boxShadow: "0 0 4px #bdc2ff" }}
          />
          PINI 분석 중
        </div>
      </div>

      {/* 목업 본문 */}
      <div className="flex min-h-[260px] sm:min-h-[300px]">

        {/* 좌: 참가자 목록 — 모바일에서 숨김, sm+에서 표시 */}
        <div
          className="hidden sm:flex w-[190px] shrink-0 flex-col border-r p-3 sm:p-4 gap-1"
          style={{ borderColor: "#23252a" }}
        >
          <p className="text-[10px] font-semibold tracking-[2px] uppercase mb-2" style={{ color: "#454652" }}>
            참가자 현황
          </p>
          {PARTICIPANTS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: p.done ? "#141516" : "transparent" }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold text-white leading-none"
                style={{ background: p.color, opacity: p.done ? 1 : 0.35 }}
              >
                {p.initials}
              </div>
              <span className="text-[12px] flex-1" style={{ color: p.done ? "#d0d6e0" : "#454652" }}>
                {p.name}
              </span>
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0"
                style={{
                  background: p.done ? "#5e6ad2" : "#1e1e22",
                  color: p.done ? "white" : "#454652",
                }}
              >
                {p.done ? "✓" : "·"}
              </span>
            </div>
          ))}

          {/* 추천 완료 칩 */}
          <div className="mt-auto pt-3" style={{ borderTop: "1px solid #23252a" }}>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full w-fit"
              style={{ background: "rgba(94,106,210,0.15)", border: "1px solid rgba(94,106,210,0.3)" }}
            >
              <span className="text-[10px]" style={{ color: "#bdc2ff" }}>✓</span>
              <span className="text-[11px] font-semibold" style={{ color: "#bdc2ff" }}>추천 완료</span>
            </div>
          </div>
        </div>

        {/* 우: 지도 + 추천 결과 */}
        <div className="flex-1 p-3 sm:p-4 relative">
          {/* 도트 그리드 배경 */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: "radial-gradient(circle at 1.5px 1.5px, #bdc2ff 1.5px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          <p className="text-[10px] font-semibold tracking-[2px] uppercase mb-3 relative" style={{ color: "#454652" }}>
            PINI 추천 결과
          </p>

          {/* 추천 카드 목록 */}
          <div className="space-y-2 relative">
            {PLACES.map((place, i) => (
              <div
                key={place.name}
                className="p-3 rounded-lg"
                style={{
                  background: i === 0 ? "#181820" : "#141516",
                  border: i === 0 ? "1px solid rgba(94,106,210,0.3)" : "1px solid #34343a",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px]">📍</span>
                    <span className="text-[12px] sm:text-[13px] font-medium" style={{ color: "#d0d6e0" }}>
                      {place.name}
                    </span>
                    {i === 0 && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(94,106,210,0.2)", color: "#bdc2ff" }}
                      >
                        1위
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-bold shrink-0" style={{ color: i === 0 ? "#bdc2ff" : "#8a8f98" }}>
                    {place.score}%
                  </span>
                </div>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "#23252a" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: place.width,
                      background: i === 0 ? "#5e6ad2" : "#34343a",
                    }}
                  />
                </div>
                <p className="text-[10px] mt-1" style={{ color: "#454652" }}>균형도</p>
              </div>
            ))}

            {/* 모바일 전용: 참가자 카운트 칩 */}
            <div className="sm:hidden flex items-center gap-2 pt-1">
              <div className="flex -space-x-1.5">
                {MOBILE_AVATARS.map((a) => (
                  <div
                    key={a.initials}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none border border-[#0d0d10]"
                    style={{ background: a.color }}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <span className="text-[11px]" style={{ color: "#8a8f98" }}>3명 참여 완료</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 히어로 섹션 ────────────────────────────────────────────── */
export function HeroSection() {
  return (
    <section className="relative px-4 sm:px-6 pt-20 sm:pt-24 pb-36 sm:pb-40 max-w-[1200px] mx-auto text-center flex flex-col items-center overflow-hidden">

      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(94,106,210,0.1) 0%, transparent 70%)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* 텍스트 블록 */}
      <div
        className="relative z-10 max-w-[860px] mb-8 sm:mb-10"
        style={{ animation: "cinematic-up 0.75s ease-out both" }}
      >
        {/* 아이브로우 */}
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
          <div className="w-5 h-px" style={{ background: "#5e6ad2" }} />
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#bdc2ff]">
            AI 모임 조율 플랫폼
          </span>
          <div className="w-5 h-px" style={{ background: "#5e6ad2" }} />
        </div>

        {/* 메인 헤드라인 */}
        <h1
          className="font-bold leading-[1.02] mb-5 sm:mb-6 text-[#f7f8f8]"
          style={{
            fontSize: "clamp(44px, 8vw, 80px)",
            letterSpacing: "-2.5px",
          }}
        >
          모임의 중심을
          <br />
          <span style={{ color: "#bdc2ff" }}>찾다</span>
        </h1>

        {/* 서브타이틀 */}
        <p
          className="text-[15px] sm:text-[17px] leading-[1.75] max-w-[480px] mx-auto"
          style={{ color: "#8a8f98" }}
        >
          참가자 위치·교통수단·분위기 선호를 분석해
          <br className="hidden sm:block" />
          모두에게 공정한 장소를 추천해드려요
        </p>
      </div>

      {/* CTA 버튼 쌍 */}
      <div
        className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-14 sm:mb-16"
        style={{ animation: "cinematic-up 0.75s ease-out 0.1s both" }}
      >
        <LandingCtaButtons size="md" />
      </div>

      {/* 제품 UI 프리뷰 */}
      <div
        className="relative w-full max-w-[960px] z-10"
        style={{ animation: "cinematic-up 0.9s ease-out 0.2s both" }}
      >
        {/* 외부 프레임 */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: "1px solid #23252a",
            boxShadow: "0 0 0 1px #23252a, 0 24px 64px rgba(0,0,0,0.65), 0 48px 120px rgba(94,106,210,0.06)",
          }}
        >
          {/* 내부 프레임 */}
          <div style={{ border: "1px solid #34343a" }}>
            <PiniUIMockup />
          </div>
        </div>

        {/* 플로팅 디테일 패널 — 데스크탑 전용 */}
        <div
          className="absolute -bottom-10 -right-4 lg:-right-8 hidden lg:block w-60 p-4 rounded-xl shadow-2xl animate-float"
          style={{ background: "#141516", border: "1px solid #34343a" }}
          aria-hidden="true"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(94,106,210,0.2)", border: "1px solid rgba(94,106,210,0.3)" }}
            >
              <span className="text-base">✓</span>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.5px] uppercase text-[#bdc2ff]">
                최적화 완료
              </p>
              <p className="text-[14px] font-semibold text-[#f7f8f8]">
                3곳 추천됨
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "#23252a" }}>
              <div className="h-full rounded-full w-full" style={{ background: "#5e6ad2" }} />
            </div>
            <p className="text-[11px] text-[#8a8f98]">
              12명 참가자 모두 합의 완료.
            </p>
          </div>
        </div>

        {/* 하단 페이드 그라디언트 — 목업 하단 자연스럽게 마무리 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 rounded-b-xl pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(1,1,2,0.7))" }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

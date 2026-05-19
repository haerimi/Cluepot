import Link from "next/link";
import { Button } from "@/app/components/ui/Button";

/* ── Sherlock hero visualization ─────────────────────────────────────────── */
function SherlockHeroViz() {
  return (
    <div className="relative w-full h-52 flex items-center justify-center overflow-hidden">

      {/* Ambient background glow */}
      <div
        className="absolute w-28 h-28 rounded-full bg-[#FF5C00]/10 blur-3xl"
        style={{ animation: "float-slow 5s ease-in-out infinite" }}
      />

      {/* Expanding pulse rings from center */}
      <div
        className="absolute w-16 h-16 rounded-full border border-[#FF5C00]/40 pointer-events-none"
        style={{ animation: "ring-pulse 2.4s ease-out infinite" }}
      />
      <div
        className="absolute w-16 h-16 rounded-full border border-[#FF5C00]/30 pointer-events-none"
        style={{ animation: "ring-pulse 2.4s ease-out 1.2s infinite" }}
      />

      {/* Orbit path rings */}
      <div className="absolute w-36 h-36 rounded-full border border-dashed border-[#FF5C00]/10 pointer-events-none" />
      <div className="absolute w-52 h-52 rounded-full border border-dashed border-[#D0CCC4]/40 pointer-events-none" />

      {/* ── Center Sherlock orb ── */}
      <div
        className="relative z-20 w-14 h-14 rounded-full bg-[#FF5C00] flex items-center justify-center"
        style={{
          boxShadow: "0 4px 24px rgba(255,92,0,0.38), 0 1px 4px rgba(255,92,0,0.2)",
          animation: "float-slow 3s ease-in-out infinite",
        }}
      >
        <span className="text-[22px] leading-none select-none">🔍</span>
      </div>

      {/* ── Participant bubbles ── */}

      {/* Top-left — 강남구 */}
      <div
        className="absolute z-10 top-4 left-[11%] flex flex-col items-center gap-1"
        style={{ animation: "float-slow 4.2s ease-in-out 0.5s infinite" }}
      >
        <div className="w-10 h-10 rounded-full bg-white border-2 border-[#E5E1D9] shadow-[0_2px_8px_rgba(28,26,23,0.10)] flex items-center justify-center">
          <span className="text-[13px] font-black text-[#1C1A17]">박</span>
        </div>
        <div className="px-2 py-0.5 bg-white rounded-full border border-[#E5E1D9] shadow-sm">
          <span className="text-[9px] font-medium text-[#908D87]">강남구</span>
        </div>
      </div>

      {/* Top-right — 마포구 */}
      <div
        className="absolute z-10 top-6 right-[9%] flex flex-col items-center gap-1"
        style={{ animation: "float-slow 3.6s ease-in-out 1.1s infinite" }}
      >
        <div className="w-10 h-10 rounded-full bg-white border-2 border-[#E5E1D9] shadow-[0_2px_8px_rgba(28,26,23,0.10)] flex items-center justify-center">
          <span className="text-[13px] font-black text-[#1C1A17]">김</span>
        </div>
        <div className="px-2 py-0.5 bg-white rounded-full border border-[#E5E1D9] shadow-sm">
          <span className="text-[9px] font-medium text-[#908D87]">마포구</span>
        </div>
      </div>

      {/* Bottom-center — 잠실 */}
      <div
        className="absolute z-10 bottom-3 left-[36%] flex flex-col items-center gap-1"
        style={{ animation: "float-slow 4.8s ease-in-out 0.3s infinite" }}
      >
        <div className="w-10 h-10 rounded-full bg-white border-2 border-[#E5E1D9] shadow-[0_2px_8px_rgba(28,26,23,0.10)] flex items-center justify-center">
          <span className="text-[13px] font-black text-[#1C1A17]">이</span>
        </div>
        <div className="px-2 py-0.5 bg-white rounded-full border border-[#E5E1D9] shadow-sm">
          <span className="text-[9px] font-medium text-[#908D87]">잠실</span>
        </div>
      </div>

      {/* ── "분석 중" thinking chip ── */}
      <div
        className="absolute z-10 bottom-5 right-[7%]"
        style={{ animation: "float-slow 5s ease-in-out 2s infinite" }}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-full border border-[#FF5C00]/25 shadow-sm">
          <div className="flex gap-[3px]">
            {([0, 0.15, 0.3] as const).map((d) => (
              <div
                key={d}
                className="w-[5px] h-[5px] rounded-full bg-[#FF5C00]"
                style={{ animation: `dot-bounce 1.2s ease-in-out ${d}s infinite` }}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-[#FF5C00]">분석 중</span>
        </div>
      </div>

      {/* ── "추천 완료" result chip (top, subtle) ── */}
      <div
        className="absolute z-10 top-3 left-[42%]"
        style={{ animation: "float-slow 4s ease-in-out 3s infinite" }}
      >
        <div className="flex items-center gap-1 px-2 py-1 bg-[#E8F5EC] rounded-full border border-[#27A644]/20 shadow-sm">
          <span className="text-[9px]">✓</span>
          <span className="text-[9px] font-semibold text-[#1A7A35]">추천 완료</span>
        </div>
      </div>
    </div>
  );
}

/* ── Feature data ─────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    emoji: "🔍",
    title: "Sherlock Mode",
    desc: "AI가 참가자 위치를 분석해 최적 장소를 추천",
    bg: "#FFF0E8",
    textColor: "#FF5C00",
  },
  {
    emoji: "📍",
    title: "중간지점 계산",
    desc: "모든 참가자에게 공평한 위치 자동 계산",
    bg: "#F0EDE7",
    textColor: "#4A4740",
  },
  {
    emoji: "🚇",
    title: "교통수단 반영",
    desc: "도보·대중교통·자가용·자전거 이동시간 고려",
    bg: "#F0EDE7",
    textColor: "#4A4740",
  },
  {
    emoji: "⚡",
    title: "실시간 추천",
    desc: "취향과 분위기까지 고려한 맞춤 장소 제안",
    bg: "#FFF0E8",
    textColor: "#FF5C00",
  },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[#F4F2EE] flex flex-col">
      {/* Top nav */}
      <header className="flex items-center justify-between px-5 pt-safe pt-4 pb-2">
        <span className="text-[20px] font-black text-[#1C1A17] tracking-tight">
          Meet<span className="text-[#FF5C00]">Spot</span>
        </span>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E5E1D9] text-[#908D87] text-[13px] shadow-sm">
          ?
        </button>
      </header>

      <main className="flex-1 flex flex-col pb-8">

        {/* ── Hero visualization ── */}
        <div className="px-2">
          <SherlockHeroViz />
        </div>

        {/* ── Text + CTAs ── */}
        <div className="px-5" style={{ animation: "fade-up 0.5s ease-out both" }}>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" style={{ animation: "waiting-dot 2s ease-in-out infinite" }} />
            <span className="text-[11px] font-bold text-[#FF5C00] tracking-[2px] uppercase">
              AI 모임 장소 추천
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[34px] font-black text-[#1C1A17] leading-[1.08] tracking-[-1.5px] mb-3">
            모임의 중심을
            <br />
            <span className="text-[#FF5C00]">찾아드립니다</span>
          </h1>

          {/* Subhead */}
          <p className="text-[14px] text-[#908D87] leading-relaxed mb-8 max-w-[270px]">
            참가자 위치와 교통수단을 분석해
            <br />
            모두에게 딱 맞는 장소를 추천해드려요
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 mb-10">
            <Link href="/room/create">
              <Button variant="primary" size="lg" fullWidth>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path d="M8.5 2.5V14.5M2.5 8.5H14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                새 모임 만들기
              </Button>
            </Link>
            <Link href="/room/join">
              <Button variant="secondary" size="lg" fullWidth>
                코드로 참가하기
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 px-5 mb-6">
          <div className="flex-1 h-px bg-[#E5E1D9]" />
          <span className="text-[11px] text-[#C4C1BC] font-medium">주요 기능</span>
          <div className="flex-1 h-px bg-[#E5E1D9]" />
        </div>

        {/* ── Feature bento grid ── */}
        <div className="grid grid-cols-2 gap-3 px-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="rounded-xl p-4 flex flex-col gap-2"
              style={{
                backgroundColor: f.bg,
                animation: `fade-up 0.4s ease-out ${0.05 + i * 0.07}s both`,
              }}
            >
              <span className="text-2xl leading-none">{f.emoji}</span>
              <div>
                <p
                  className="text-[13px] font-bold leading-snug"
                  style={{ color: f.textColor }}
                >
                  {f.title}
                </p>
                <p className="text-[11px] text-[#908D87] leading-relaxed mt-0.5">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 pb-safe pb-6 text-center">
        <p className="text-[11px] text-[#C4C1BC]">
          카카오맵 기반 · 위치 데이터는 저장되지 않아요
        </p>
      </footer>
    </div>
  );
}

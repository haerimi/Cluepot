/**
 * Bento Grid 피처 섹션
 * 기존 Philosophy + How It Works + Feature Strip 3개 섹션을 통합
 * 각 카드는 기존 한글 콘텐츠를 재배치
 */

/* ── 모듈 스코프 정적 데이터 ────────────────────────────────── */
const VIZ_NODES = [
  { x: "14%", y: "28%", label: "강남구" },
  { x: "76%", y: "22%", label: "마포구" },
  { x: "52%", y: "74%", label: "잠실" },
  { x: "84%", y: "62%", label: "서초구" },
] as const;

const VIZ_CENTER = { x: "47%", y: "46%" } as const;

const AVATARS = [
  { label: "김도", color: "#3a4a9e" },
  { label: "이수", color: "#2d5c8e" },
  { label: "민준", color: "#3d6b6b" },
  { label: "수아", color: "#6b3d6b" },
  { label: "+8", color: "#2a292d" },
] as const;

const TRANSPORT_TAGS = ["🚶 도보", "🚇 지하철", "🚗 자가용"] as const;

/* 아이콘 박스 스타일 — 4개 카드에서 공유 */
const ICON_BOX_STYLE = {
  background: "rgba(94,106,210,0.18)",
  border: "1px solid rgba(94,106,210,0.25)",
} as const;

/* ── 알고리즘 시각화 (메인 카드 내 이미지 대용) ─────────────── */
function AlgorithmViz() {
  return (
    <div
      className="relative w-full h-44 rounded-lg overflow-hidden"
      style={{ background: "#0a0a0d", border: "1px solid #23252a" }}
      aria-hidden="true"
    >
      {/* 도트 그리드 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(189,194,255,0.06) 1.5px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* 방사형 글로우 — 중심 */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none"
        style={{
          left: VIZ_CENTER.x,
          top: VIZ_CENTER.y,
          background: "radial-gradient(circle, rgba(94,106,210,0.2) 0%, transparent 70%)",
        }}
      />

      {/* SVG 연결선 */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
        {VIZ_NODES.map((n) => (
          <line
            key={n.label}
            x1={VIZ_CENTER.x} y1={VIZ_CENTER.y}
            x2={n.x} y2={n.y}
            stroke="#5e6ad2"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeDasharray="3 4"
          />
        ))}
      </svg>

      {/* 중심 노드 */}
      <div
        className="absolute w-9 h-9 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        style={{
          left: VIZ_CENTER.x,
          top: VIZ_CENTER.y,
          background: "#5e6ad2",
          boxShadow: "0 0 24px rgba(94,106,210,0.55), 0 0 8px rgba(94,106,210,0.4)",
        }}
      >
        <span className="text-[14px]">🔍</span>
      </div>

      {/* 참가자 노드 */}
      {VIZ_NODES.map((n) => (
        <div
          key={n.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
          style={{ left: n.x, top: n.y }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "#1e1e24", border: "1px solid #34343a" }}
          >
            <span className="text-[11px]">📍</span>
          </div>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ color: "#8a8f98", background: "#0f1011", border: "1px solid #23252a" }}
          >
            {n.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── 아바타 스택 ──────────────────────────────────────────── */
function AvatarStack() {
  return (
    <div className="flex -space-x-2">
      {AVATARS.map((a) => (
        <div
          key={a.label}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
          style={{
            background: a.color,
            border: "2px solid #0f1011",
            color: a.label === "+8" ? "#8a8f98" : "white",
          }}
        >
          {a.label}
        </div>
      ))}
    </div>
  );
}

/* ── Bento Grid 섹션 ────────────────────────────────────── */
export function BentoGrid() {
  return (
    <section
      className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6"
      style={{ background: "#010102" }}
    >
      <div className="max-w-[1200px] mx-auto">

        {/* 섹션 헤더 */}
        <div
          className="flex items-center gap-4 mb-10 sm:mb-14"
          style={{ animation: "fade-up 0.5s ease-out both" }}
        >
          <div className="w-6 h-px" style={{ background: "#5e6ad2" }} />
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#8a8f98]">
            PINI 작동 방식
          </span>
        </div>

        {/* Bento Grid — 모바일 단일 컬럼, md+ 12컬럼 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-4">

          {/* 메인 카드 — col-span-8 / 강조 hover */}
          <div
            className="md:col-span-8 bento-card bento-card-main surface-ladder-1 p-6 sm:p-8 rounded-xl flex flex-col justify-between"
            style={{ animation: "fade-up 0.5s ease-out 0.05s both" }}
          >
            <div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-xl"
                style={ICON_BOX_STYLE}
              >
                ⚡
              </div>
              <h3
                className="font-bold mb-3 text-[#f7f8f8]"
                style={{ fontSize: "20px", letterSpacing: "-0.4px" }}
              >
                PINI 조율 엔진
              </h3>
              <p
                className="text-[14px] sm:text-[15px] leading-[1.75] max-w-[400px] text-[#8a8f98]"
              >
                다수결이 아닙니다. 모든 참가자의 이동 부담을 균등화하고
                분위기 선호를 수치화해 최적 후보군을 생성해요.
              </p>
            </div>
            <div className="mt-6">
              <AlgorithmViz />
            </div>
          </div>

          {/* 보조 카드 — col-span-4 */}
          <div
            className="md:col-span-4 bento-card surface-ladder-1 p-5 sm:p-6 rounded-xl flex flex-col gap-4"
            style={{ animation: "fade-up 0.5s ease-out 0.1s both" }}
          >
            <div className="flex-grow">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg"
                style={ICON_BOX_STYLE}
              >
                🛡️
              </div>
              <h4
                className="font-semibold mb-2 text-[#f7f8f8]"
                style={{ fontSize: "17px", letterSpacing: "-0.2px" }}
              >
                리뷰 신뢰 검증
              </h4>
              <p className="text-[13px] leading-[1.75] text-[#8a8f98]">
                광고성 후기와 실제 방문자 후기를 구분해
                신뢰할 수 있는 정보만 추천에 활용해요.
              </p>
            </div>
            <div className="pt-4" style={{ borderTop: "1px solid #23252a" }}>
              <p className="text-[11px] font-medium mb-2.5 text-[#454652]">현재 분석 중인 팀</p>
              <AvatarStack />
            </div>
          </div>

          {/* 작은 카드 — col-span-4 */}
          <div
            className="md:col-span-4 bento-card surface-ladder-1 p-5 sm:p-6 rounded-xl flex flex-col gap-3"
            style={{ animation: "fade-up 0.5s ease-out 0.15s both" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={ICON_BOX_STYLE}
            >
              🚇
            </div>
            <div>
              <h4
                className="font-semibold mb-1.5 text-[#f7f8f8]"
                style={{ fontSize: "17px", letterSpacing: "-0.2px" }}
              >
                교통수단 반영
              </h4>
              <p className="text-[13px] leading-[1.75] text-[#8a8f98]">
                도보·지하철·자가용 모두 고려해 이동 방식별
                소요 시간을 정확히 계산해요.
              </p>
            </div>

            {/* 교통수단 태그 */}
            <div className="flex gap-1.5 flex-wrap mt-auto pt-2">
              {TRANSPORT_TAGS.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-medium px-2 py-1 rounded-full"
                  style={{ background: "#1e1e24", color: "#8a8f98", border: "1px solid #2a2a30" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* 수평 카드 — col-span-8 */}
          <div
            className="md:col-span-8 bento-card surface-ladder-1 p-5 sm:p-6 rounded-xl relative overflow-hidden"
            style={{ animation: "fade-up 0.5s ease-out 0.2s both" }}
          >
            {/* 오른쪽 그라디언트 오버레이 */}
            <div
              className="absolute right-0 top-0 h-full w-2/5 pointer-events-none"
              style={{ background: "linear-gradient(to left, rgba(94,106,210,0.06), transparent)" }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={ICON_BOX_STYLE}
              >
                💬
              </div>
              <div>
                <h4
                  className="font-semibold mb-1 text-[#f7f8f8]"
                  style={{ fontSize: "17px", letterSpacing: "-0.2px" }}
                >
                  이유와 함께 추천
                </h4>
                <p className="text-[13px] leading-[1.7] text-[#8a8f98]">
                  왜 이 장소인지 PINI가 직접 설명해요.
                  균형도 수치와 참가자별 이동 시간을 투명하게 공개해요.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

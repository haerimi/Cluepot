import Link from "next/link";

/**
 * 하단 CTA 섹션 — 카드형 박스 디자인
 * 기존 CTA 섹션의 한글 문구 유지
 */
export function CtaSection() {
  return (
    <section
      className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6"
      style={{ background: "#010102" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div
          className="relative rounded-2xl px-6 py-14 sm:p-14 lg:p-20 text-center overflow-hidden"
          style={{
            background: "#0d0d12",
            border: "1px solid #2a2a34",
          }}
        >
          {/* 다층 radial gradient 배경 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                "radial-gradient(ellipse 80% 50% at 50% 110%, rgba(94,106,210,0.14) 0%, transparent 60%)",
                "radial-gradient(ellipse 40% 30% at 50% 100%, rgba(94,106,210,0.08) 0%, transparent 50%)",
              ].join(", "),
            }}
            aria-hidden="true"
          />

          {/* 상단 미세 하이라이트 라인 */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none"
            style={{
              width: "60%",
              background: "linear-gradient(to right, transparent, rgba(94,106,210,0.4), transparent)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-[520px] mx-auto">

            {/* 에디토리얼 구분선 */}
            <div className="flex items-center justify-center gap-4 mb-8 sm:mb-10">
              <div className="h-px w-10" style={{ background: "#2a2a34" }} />
              <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#8a8f98]">
                지금 시작하기
              </span>
              <div className="h-px w-10" style={{ background: "#2a2a34" }} />
            </div>

            {/* 헤드라인 */}
            <h2
              className="font-bold mb-5 sm:mb-6 text-[#f7f8f8]"
              style={{
                fontSize: "clamp(32px, 5.5vw, 54px)",
                letterSpacing: "-1.8px",
                lineHeight: "1.06",
              }}
            >
              모두가 만족하는
              <br />
              <span style={{ color: "#bdc2ff" }}>장소를 찾아요</span>
            </h2>

            {/* 서브타이틀 */}
            <p
              className="text-[14px] sm:text-[15px] leading-[1.8] mb-10 text-[#8a8f98]"
            >
              위치 데이터는 저장하지 않아요.
              <br />
              분석 후 즉시 삭제되며, 카카오맵 기반으로 운영돼요.
            </p>

            {/* CTA 버튼 — Link를 버튼 스타일로 직접 사용 (a > button 중첩 방지) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link
                href="/rooms/create"
                className="btn-primary-landing btn-cta-pulse w-full sm:w-auto h-12 px-10 sm:px-12 text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 focus-visible:outline-none"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1V13M1 7H13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                새 모임 만들기
              </Link>
              <Link
                href="/rooms/join"
                className="btn-secondary-landing w-full sm:w-auto h-12 px-10 sm:px-12 text-[14px] font-medium rounded-lg flex items-center justify-center focus-visible:outline-none"
              >
                코드로 참가하기
              </Link>
            </div>

            {/* 신뢰 문구 */}
            <p className="mt-6 text-[12px] text-[#454652]">
              무료 · 회원가입 불필요 · 위치 데이터 저장 안 함
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

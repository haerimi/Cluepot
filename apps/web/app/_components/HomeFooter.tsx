import Link from "next/link";
import { BrandLogo } from "./LandingShared";

/**
 * 랜딩 페이지 푸터
 * 다크 테마 / 기존 한글 안내 문구 유지
 */
export function HomeFooter() {
  return (
    <footer
      className="w-full py-8 sm:py-10 px-4 sm:px-6"
      style={{
        background: "#08080a",
        borderTop: "1px solid #1e1e24",
      }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

        {/* 로고 + 설명 */}
        <div className="space-y-2">
          <Link
            href="/"
            aria-label="CluePot 홈으로"
            className="flex items-center gap-2 hover:opacity-75 transition-opacity focus-ring-landing rounded w-fit"
          >
            <BrandLogo size="sm" />
          </Link>
          <p className="text-[12px] text-[#3a3a42]">
            카카오맵 기반 · 위치 데이터는 저장되지 않아요
          </p>
        </div>

        {/* 우측: 링크 + 저작권 */}
        <div className="flex flex-col sm:items-end gap-2.5">
          <div className="flex items-center gap-4">
            <Link
              href="/rooms/join"
              className="text-[12px] text-[#3a3a42] hover:text-[#8a8f98] transition-colors duration-200 focus-ring-landing rounded"
            >
              코드로 참가
            </Link>
            <span style={{ color: "#23252a" }}>·</span>
            <Link
              href="/login"
              className="text-[12px] text-[#3a3a42] hover:text-[#8a8f98] transition-colors duration-200 focus-ring-landing rounded"
            >
              로그인
            </Link>
            <span style={{ color: "#23252a" }}>·</span>
            <Link
              href="/rooms/create"
              className="text-[12px] text-[#3a3a42] hover:text-[#8a8f98] transition-colors duration-200 focus-ring-landing rounded"
            >
              새 모임 만들기
            </Link>
          </div>
          <p className="text-[11px] text-[#2a2a30]">
            © 2026 CluePot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { logout } from "@/app/actions/auth";

/**
 * 랜딩 페이지 전용 네비게이션 바
 * 다크 테마 적용 / 로그인 상태에 따라 우측 액션 분기
 */

export type HomeNavUser = {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
};

export function HomeNav({ user }: Readonly<{ user: HomeNavUser | null }>) {
  const displayName = user?.nickname || user?.email?.split("@")[0] || "";

  return (
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

        {/* 브랜드 로고 */}
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

        {/* 우측 액션 영역 */}
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="메인 네비게이션">
          <Link
            href="/rooms/join"
            className="hidden sm:block text-[13px] font-medium text-[#8a8f98] hover:text-[#d0d6e0] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-1 focus-visible:ring-offset-[#010102] rounded px-1"
          >
            코드로 참가
          </Link>

          {user ? (
            <>
              <Link
                href="/calendar"
                className="hidden md:block text-[13px] font-medium text-[#8a8f98] hover:text-[#d0d6e0] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded px-1"
              >
                내 일정
              </Link>
              <Link
                href="/rooms"
                className="hidden md:block text-[13px] font-medium text-[#8a8f98] hover:text-[#d0d6e0] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded px-1"
              >
                내 모임
              </Link>

              {/* 유저 뱃지 + 로그아웃 */}
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2.5 h-9 rounded-full transition-colors hover:bg-[#1e1e24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]"
                  style={{ border: "1px solid #34343a" }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: "#5e6ad2" }}
                  >
                    {user.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profileImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[8px] font-bold text-white leading-none">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] font-medium hidden sm:block text-[#f7f8f8]">
                    {displayName}
                  </span>
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="h-9 px-3 text-[12px] font-medium rounded-full border border-[#34343a] text-[#8a8f98] hover:text-[#d0d6e0] hover:border-[#454652] transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]"
                    style={{ background: "transparent" }}
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="h-9 px-4 text-[13px] font-medium rounded-lg border border-[#34343a] text-[#d0d6e0] hover:text-white hover:border-[#454652] hover:bg-[#1a1a1e] flex items-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]"
              >
                로그인
              </Link>
              <Link
                href="/rooms/create"
                className="btn-primary-landing h-9 px-4 text-[13px] font-semibold rounded-lg flex items-center focus-visible:outline-none"
              >
                새 모임 만들기
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

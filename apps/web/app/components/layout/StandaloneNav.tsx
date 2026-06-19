"use client";

import Link from "next/link";

interface StandaloneNavProps {
  backHref?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="10" stroke="#5e6ad2" strokeWidth="1.5"/>
      <path d="M6 14L9.5 8L11 11.5L13 9L16 14" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function StandaloneNav({ backHref, onBack, rightSlot }: StandaloneNavProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
      style={{
        background: "rgba(1,1,2,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid #23252a",
      }}
    >
      {/* 뒤로가기 버튼 영역 */}
      <div className="w-9 flex items-center">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-ink-subtle hover:bg-surface-2 hover:text-ink transition-all duration-150"
            aria-label="뒤로가기"
          >
            <IconBack />
          </Link>
        )}
        {onBack && !backHref && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-ink-subtle hover:bg-surface-2 hover:text-ink transition-all duration-150"
            aria-label="뒤로가기"
          >
            <IconBack />
          </button>
        )}
      </div>

      {/* 브랜드 로고 + 이름 */}
      <div className="flex items-center gap-2">
        <IconLogo />
        <span className="text-[15px] font-bold text-ink tracking-tight">MeetSpot</span>
      </div>

      {/* 오른쪽 슬롯 */}
      <div className="w-9 flex items-center justify-end">
        {rightSlot}
      </div>
    </header>
  );
}

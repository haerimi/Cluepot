import Link from "next/link";

/**
 * 랜딩 페이지 공용 UI 원자
 * - BrandLogo: HomeNav + HomeFooter 공유 로고 SVG
 * - PlusIcon: CTA 버튼 내 아이콘
 * - LandingCtaButtons: HeroSection + CtaSection 공유 버튼 쌍
 */

/* ── 브랜드 로고 ────────────────────────────────────────────── */
type LogoSize = "sm" | "md";

const LOGO_CFG: Record<LogoSize, { container: string; iconSize: number; textClass: string }> = {
  sm: { container: "w-6 h-6", iconSize: 12, textClass: "text-[17px]" },
  md: { container: "w-8 h-8", iconSize: 16, textClass: "text-[20px] sm:text-[22px]" },
};

export function BrandLogo({ size = "md" }: { size?: LogoSize }) {
  const cfg = LOGO_CFG[size];
  return (
    <>
      <div
        className={`${cfg.container} rounded flex items-center justify-center shrink-0`}
        style={{ background: "#5e6ad2" }}
      >
        <svg width={cfg.iconSize} height={cfg.iconSize} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
        </svg>
      </div>
      <span className={`${cfg.textClass} font-bold tracking-tight text-[#bdc2ff]`}>
        CluePot
      </span>
    </>
  );
}

/* ── 플러스 아이콘 ─────────────────────────────────────────── */
export function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1V13M1 7H13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── 랜딩 CTA 버튼 쌍 ──────────────────────────────────────── */
export function LandingCtaButtons({
  pulse = false,
  size = "md",
}: {
  pulse?: boolean;
  size?: "md" | "lg";
}) {
  const px = size === "lg" ? "px-10 sm:px-12" : "px-8 sm:px-10";

  return (
    <>
      <Link
        href="/rooms/create"
        className={[
          "btn-primary-landing",
          pulse ? "btn-cta-pulse" : "",
          `w-full sm:w-auto h-12 ${px} text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 focus-ring-landing`,
        ].filter(Boolean).join(" ")}
      >
        <PlusIcon />
        새 모임 만들기
      </Link>
      <Link
        href="/rooms/join"
        className={`btn-secondary-landing w-full sm:w-auto h-12 ${px} text-[14px] font-medium rounded-lg flex items-center justify-center focus-ring-landing`}
      >
        코드로 참가하기
      </Link>
    </>
  );
}

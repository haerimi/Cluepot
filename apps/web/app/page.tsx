import { cookies } from "next/headers";
import { createClient } from "@/util/supabase/server";
import { prisma } from "@/lib/prisma";
import { HomeNav, type HomeNavUser } from "./_components/HomeNav";
import { HeroSection } from "./_components/HeroSection";
import { BentoGrid } from "./_components/BentoGrid";
import { CtaSection } from "./_components/CtaSection";
import { HomeFooter } from "./_components/HomeFooter";

/**
 * 메인 랜딩 페이지
 *
 * 인증 로직: 기존과 동일하게 서버에서 세션 조회 후 HomeNav에 전달
 * UI: 다크 테마 리뉴얼 (Stitch 디자인 시안 기반)
 */
export default async function HomePage() {
  /* ── 기존 인증/DB 조회 로직 유지 ── */
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const dbUser = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { nickname: true, profileImage: true },
      })
    : null;

  const displayName = dbUser?.nickname
    || (user?.user_metadata?.nickname as string | undefined)
    || user?.email?.split("@")[0]
    || "";
  const profileImage = dbUser?.profileImage ?? null;

  const userProps: HomeNavUser | null = user
    ? {
        id: user.id,
        email: user.email ?? "",
        nickname: displayName,
        profileImage,
      }
    : null;

  return (
    <div style={{ background: "#010102", color: "#f7f8f8", minHeight: "100dvh" }}>

      {/* 고정 네비게이션 */}
      <HomeNav user={userProps} />

      <main className="pt-14 overflow-x-hidden">

        {/* 히어로 */}
        <HeroSection />

        <div style={{ height: "1px", background: "#23252a" }} />

        {/* Bento Grid 피처 섹션 */}
        <BentoGrid />

        <div style={{ height: "1px", background: "#23252a" }} />

        {/* 하단 CTA */}
        <CtaSection />

      </main>

      {/* 푸터 */}
      <HomeFooter />

    </div>
  );
}

import { redirect } from "next/navigation";
import Script from "next/script";
import { getScheduleById } from "@/app/actions/schedule";
import { ScheduleDetailView } from "./_components/ScheduleDetailView";

interface Props {
  params: Promise<Readonly<{ scheduleId: string }>>;
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { scheduleId } = await params;
  const schedule = await getScheduleById(scheduleId);
  if (!schedule) redirect("/calendar");
  return (
    <>
      {/* Kakao Maps SDK — loaded only on pages that render a KakaoMap */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
      />
      <ScheduleDetailView schedule={schedule} />
    </>
  );
}

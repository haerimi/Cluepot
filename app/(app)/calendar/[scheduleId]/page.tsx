import type { ScheduleDetail } from "@/app/actions/schedule";
import { ScheduleDetailView } from "./_components/ScheduleDetailView";

const MOCK_SCHEDULE: ScheduleDetail = {
  id: "mock-1",
  title: "블루보틀 커피 삼청점 미팅",
  placeName: "블루보틀 커피 삼청점",
  placeAddress: "서울 종로구 삼청로 100",
  lat: 37.5825,
  lng: 126.9822,
  scheduledAt: new Date("2026-06-16T15:00:00+09:00").toISOString(),
  memo: "조용한 분위기로 오래 이야기할 수 있는 곳으로 선정했어요.",
  createdBy: "user-1",
  createdAt: new Date("2026-05-22T10:00:00+09:00").toISOString(),
  members: [
    { id: "m1", userId: "user-1", status: "accepted", nickname: "박해림", profileImage: null },
    { id: "m2", userId: "user-2", status: "pending",  nickname: "김철수",  profileImage: null },
    { id: "m3", userId: "user-3", status: "accepted", nickname: "이영희", profileImage: null },
  ],
  currentUserId: "user-1",
};

interface Props {
  params: Promise<Readonly<{ scheduleId: string }>>;
}

export default async function ScheduleDetailPage({ params }: Props) {
  await params; // consume params to satisfy Next.js
  return <ScheduleDetailView schedule={MOCK_SCHEDULE} />;
}

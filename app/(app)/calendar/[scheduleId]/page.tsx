import { getScheduleById } from "@/app/actions/schedule";
import { ScheduleDetailView } from "./_components/ScheduleDetailView";

interface Props {
  params: Promise<Readonly<{ scheduleId: string }>>;
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { scheduleId } = await params;
  const schedule = await getScheduleById(scheduleId);
  if (!schedule) return <p>일정을 찾을 수 없어요.</p>;
  return <ScheduleDetailView schedule={schedule} />;
}

import { redirect } from "next/navigation";
import { getScheduleById } from "@/app/actions/schedule";
import { ScheduleDetailView } from "./_components/ScheduleDetailView";

interface Props {
  params: Promise<Readonly<{ scheduleId: string }>>;
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { scheduleId } = await params;
  const schedule = await getScheduleById(scheduleId);
  if (!schedule) redirect("/calendar");
  return <ScheduleDetailView schedule={schedule} />;
}
